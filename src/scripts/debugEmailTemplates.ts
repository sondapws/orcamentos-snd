// Script para debugar templates de e-mail
import { supabase } from '@/integrations/supabase/client';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';

export const debugEmailTemplates = async () => {
  console.log('=== DEBUG DOS TEMPLATES DE E-MAIL ===');
  console.log('');

  try {
    // 1. Listar todos os templates no banco
    console.log('1. TEMPLATES NO BANCO DE DADOS:');
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar templates:', error);
      return;
    }

    if (!templates || templates.length === 0) {
      console.log('❌ Nenhum template encontrado no banco');
    } else {
      templates.forEach((template, index) => {
        console.log(`\n${index + 1}. Template: ${template.nome}`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Assunto: "${template.assunto}"`);
        console.log(`   Ativo: ${template.ativo}`);
        console.log(`   Vinculado ao formulário: ${template.vinculado_formulario}`);
        console.log(`   Formulário: ${template.formulario || 'null'}`);
        console.log(`   Modalidade: ${template.modalidade || 'null'}`);
        console.log(`   Criado em: ${new Date(template.created_at).toLocaleString('pt-BR')}`);
      });
    }

    console.log('\n' + '='.repeat(50));

    // 2. Testar busca com fallback para diferentes combinações
    console.log('\n2. TESTE DE BUSCA COM FALLBACK:');
    
    const testCases = [
      { formulario: 'comply_edocs' as const, modalidade: 'on-premise' as const },
      { formulario: 'comply_edocs' as const, modalidade: 'saas' as const },
      { formulario: 'comply_fiscal' as const, modalidade: 'on-premise' as const },
      { formulario: 'comply_fiscal' as const, modalidade: 'saas' as const }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testando: ${testCase.formulario} + ${testCase.modalidade}`);
      
      try {
        const result = await emailTemplateMappingService.findWithFallback(
          testCase.formulario,
          testCase.modalidade
        );

        if (result.template) {
          console.log(`✅ Template encontrado: ${result.template.nome}`);
          console.log(`   Assunto: "${result.template.assunto}"`);
          console.log(`   É padrão: ${result.isDefault}`);
          console.log(`   Mapeamento encontrado: ${result.mappingFound}`);
          console.log(`   Tipo de fallback: ${result.fallbackType}`);
          console.log(`   Razão: ${result.fallbackReason}`);
        } else {
          console.log(`❌ Nenhum template encontrado`);
          console.log(`   Tipo de fallback: ${result.fallbackType}`);
          console.log(`   Razão: ${result.fallbackReason}`);
        }
      } catch (error) {
        console.error(`❌ Erro na busca: ${error}`);
      }
    }

    console.log('\n' + '='.repeat(50));

    // 3. Simular substituição de variáveis
    console.log('\n3. TESTE DE SUBSTITUIÇÃO DE VARIÁVEIS:');
    
    const mockFormData = {
      razaoSocial: 'EMPRESA TESTE LTDA',
      responsavel: 'João Silva',
      cnpj: '12.345.678/0001-95',
      email: 'joao@empresa.com',
      segmento: 'Tecnologia',
      modalidade: 'saas'
    };

    console.log('Dados do formulário de teste:', mockFormData);

    for (const testCase of testCases) {
      console.log(`\n🔄 Processando: ${testCase.formulario} + ${testCase.modalidade}`);
      
      try {
        const result = await emailTemplateMappingService.findWithFallback(
          testCase.formulario,
          testCase.modalidade
        );

        if (result.template) {
          // Simular a substituição de variáveis
          let processedSubject = result.template.assunto;
          
          const variables = {
            razaoSocial: mockFormData.razaoSocial,
            responsavel: mockFormData.responsavel,
            cnpj: mockFormData.cnpj,
            email: mockFormData.email,
            segmento: mockFormData.segmento,
            modalidade: mockFormData.modalidade
          };

          Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processedSubject = processedSubject.replace(regex, String(value));
          });

          console.log(`   Template original: "${result.template.assunto}"`);
          console.log(`   Após substituição: "${processedSubject}"`);
          
          // Verificar se há duplicação
          if (processedSubject.toLowerCase().includes('seu orçamento') && 
              processedSubject.toLowerCase().split('seu orçamento').length > 2) {
            console.log(`   ⚠️  POSSÍVEL DUPLICAÇÃO DETECTADA!`);
          }
        }
      } catch (error) {
        console.error(`❌ Erro no processamento: ${error}`);
      }
    }

  } catch (error) {
    console.error('Erro geral no debug:', error);
  }
};

export const checkTemplateSubjects = async () => {
  console.log('=== VERIFICAÇÃO DE ASSUNTOS DUPLICADOS ===');
  
  try {
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('id, nome, assunto, ativo')
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar templates:', error);
      return;
    }

    console.log('Templates ativos encontrados:');
    templates?.forEach(template => {
      const subject = template.assunto.toLowerCase();
      const hasMultipleSeuOrcamento = subject.split('seu orçamento').length > 2;
      
      console.log(`\n📧 ${template.nome}`);
      console.log(`   Assunto: "${template.assunto}"`);
      
      if (hasMultipleSeuOrcamento) {
        console.log(`   ⚠️  DUPLICAÇÃO DETECTADA NO ASSUNTO!`);
      } else if (subject.includes('seu orçamento')) {
        console.log(`   ✅ Assunto OK (contém "seu orçamento" uma vez)`);
      } else {
        console.log(`   ℹ️  Assunto não contém "seu orçamento"`);
      }
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
  }
};

// Disponibilizar funções globalmente para uso no console
if (typeof window !== 'undefined') {
  (window as any).debugEmailTemplates = debugEmailTemplates;
  (window as any).checkTemplateSubjects = checkTemplateSubjects;
  
  console.log('🔧 Funções de debug de templates disponíveis:');
  console.log('- debugEmailTemplates() - Debug completo dos templates');
  console.log('- checkTemplateSubjects() - Verificar assuntos duplicados');
}