// Script para corrigir assuntos duplicados nos templates
import { supabase } from '@/integrations/supabase/client';

export const fixDuplicateSubjects = async () => {
  console.log('=== CORREÇÃO DE ASSUNTOS DUPLICADOS ===');
  console.log('');

  try {
    // 1. Buscar todos os templates ativos
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar templates:', error);
      return;
    }

    if (!templates || templates.length === 0) {
      console.log('❌ Nenhum template encontrado');
      return;
    }

    console.log(`Encontrados ${templates.length} templates ativos`);

    // 2. Identificar e corrigir templates com assuntos duplicados
    const templatesParaCorrigir = [];

    for (const template of templates) {
      const assunto = template.assunto.toLowerCase();
      const hasDuplication = assunto.split('seu orçamento').length > 2;

      if (hasDuplication) {
        console.log(`\n⚠️  DUPLICAÇÃO ENCONTRADA:`);
        console.log(`   Template: ${template.nome}`);
        console.log(`   Assunto atual: "${template.assunto}"`);

        // Propor correção
        let novoAssunto = template.assunto;

        // Remover duplicações comuns
        if (assunto.includes('seu orçamento - seu orçamento')) {
          novoAssunto = template.assunto.replace(/seu orçamento - seu orçamento/gi, 'Orçamento Comply');
        } else if (assunto.includes('seu orçamento seu orçamento')) {
          novoAssunto = template.assunto.replace(/seu orçamento seu orçamento/gi, 'Orçamento Comply');
        } else if (assunto.match(/seu orçamento.*seu orçamento/gi)) {
          // Caso mais genérico - substituir primeira ocorrência
          novoAssunto = template.assunto.replace(/seu orçamento/gi, 'Orçamento Comply');
          // Se ainda tem duplicação, limpar
          if (novoAssunto.toLowerCase().split('orçamento comply').length > 2) {
            novoAssunto = novoAssunto.replace(/orçamento comply - /gi, '');
          }
        }

        console.log(`   Assunto proposto: "${novoAssunto}"`);

        templatesParaCorrigir.push({
          id: template.id,
          nome: template.nome,
          assuntoAtual: template.assunto,
          novoAssunto: novoAssunto
        });
      }
    }

    if (templatesParaCorrigir.length === 0) {
      console.log('✅ Nenhum template com duplicação encontrado');
      return;
    }

    console.log(`\n📝 ${templatesParaCorrigir.length} template(s) precisam de correção:`);
    templatesParaCorrigir.forEach((t, index) => {
      console.log(`\n${index + 1}. ${t.nome}`);
      console.log(`   De: "${t.assuntoAtual}"`);
      console.log(`   Para: "${t.novoAssunto}"`);
    });

    // 3. Aplicar correções (apenas em ambiente de desenvolvimento)
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmar = window.confirm(
        `Deseja aplicar as correções em ${templatesParaCorrigir.length} template(s)?`
      );

      if (confirmar) {
        console.log('\n🔧 Aplicando correções...');

        for (const template of templatesParaCorrigir) {
          try {
            const { error: updateError } = await supabase
              .from('email_templates')
              .update({ assunto: template.novoAssunto })
              .eq('id', template.id);

            if (updateError) {
              console.error(`❌ Erro ao atualizar ${template.nome}:`, updateError);
            } else {
              console.log(`✅ ${template.nome} atualizado com sucesso`);
            }
          } catch (error) {
            console.error(`❌ Erro ao processar ${template.nome}:`, error);
          }
        }

        console.log('\n🎉 Correções aplicadas!');
      } else {
        console.log('❌ Correções canceladas pelo usuário');
      }
    } else {
      console.log('\n⚠️  Para aplicar as correções, execute: fixDuplicateSubjects() no console do navegador');
    }

  } catch (error) {
    console.error('Erro geral na correção:', error);
  }
};

export const previewSubjectFixes = async () => {
  console.log('=== PREVIEW DAS CORREÇÕES ===');
  
  try {
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('id, nome, assunto')
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar templates:', error);
      return;
    }

    console.log('Simulação de correções:');
    
    templates?.forEach(template => {
      const assunto = template.assunto.toLowerCase();
      const hasDuplication = assunto.split('seu orçamento').length > 2;

      if (hasDuplication) {
        let novoAssunto = template.assunto;

        // Aplicar mesma lógica de correção
        if (assunto.includes('seu orçamento - seu orçamento')) {
          novoAssunto = template.assunto.replace(/seu orçamento - seu orçamento/gi, 'Orçamento Comply');
        } else if (assunto.includes('seu orçamento seu orçamento')) {
          novoAssunto = template.assunto.replace(/seu orçamento seu orçamento/gi, 'Orçamento Comply');
        } else if (assunto.match(/seu orçamento.*seu orçamento/gi)) {
          novoAssunto = template.assunto.replace(/seu orçamento/gi, 'Orçamento Comply');
          if (novoAssunto.toLowerCase().split('orçamento comply').length > 2) {
            novoAssunto = novoAssunto.replace(/orçamento comply - /gi, '');
          }
        }

        console.log(`\n📧 ${template.nome}`);
        console.log(`   Atual: "${template.assunto}"`);
        console.log(`   Novo:  "${novoAssunto}"`);
      }
    });

  } catch (error) {
    console.error('Erro no preview:', error);
  }
};

// Disponibilizar funções globalmente
if (typeof window !== 'undefined') {
  (window as any).fixDuplicateSubjects = fixDuplicateSubjects;
  (window as any).previewSubjectFixes = previewSubjectFixes;
  
  console.log('🔧 Funções de correção disponíveis:');
  console.log('- previewSubjectFixes() - Ver preview das correções');
  console.log('- fixDuplicateSubjects() - Aplicar correções');
}