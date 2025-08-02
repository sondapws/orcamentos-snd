/**
 * Exemplo de uso do EmailTemplateMappingService
 * 
 * Este arquivo demonstra como usar o serviço de mapeamento de templates
 * em diferentes cenários do sistema.
 */

import { emailTemplateMappingService, EmailTemplateError } from './emailTemplateMappingService';

// Exemplo 1: Buscar template específico para um formulário e modalidade
export async function exemploFindByMapping() {
  try {
    console.log('=== Exemplo: Buscar template específico ===');
    
    // Buscar template para Comply e-DOCS + SaaS
    const template = await emailTemplateMappingService.findByMapping('comply_edocs', 'saas');
    
    if (template) {
      console.log(`Template encontrado: ${template.nome}`);
      console.log(`Assunto: ${template.assunto}`);
      console.log(`Formulário: ${template.formulario}`);
      console.log(`Modalidade: ${template.modalidade}`);
    } else {
      console.log('Nenhum template específico encontrado para esta combinação');
    }
    
    return template;
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      console.error(`Erro do serviço: ${error.message} (${error.code})`);
    } else {
      console.error('Erro inesperado:', error);
    }
    return null;
  }
}

// Exemplo 2: Validar se um mapeamento é único antes de criar
export async function exemploValidateUniqueness() {
  try {
    console.log('=== Exemplo: Validar unicidade de mapeamento ===');
    
    // Verificar se já existe template para Comply Fiscal + On-premise
    const isUnique = await emailTemplateMappingService.validateUniqueness('comply_fiscal', 'on-premise');
    
    if (isUnique) {
      console.log('✅ Combinação é única - pode criar novo template');
    } else {
      console.log('❌ Já existe template para esta combinação');
    }
    
    return isUnique;
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      console.error(`Erro do serviço: ${error.message} (${error.code})`);
    } else {
      console.error('Erro inesperado:', error);
    }
    return false;
  }
}

// Exemplo 3: Listar todos os mapeamentos existentes
export async function exemploGetMappingsList() {
  try {
    console.log('=== Exemplo: Listar todos os mapeamentos ===');
    
    const mappings = await emailTemplateMappingService.getMappingsList();
    
    console.log(`Encontrados ${mappings.length} mapeamentos:`);
    
    mappings.forEach((mapping, index) => {
      console.log(`${index + 1}. ${mapping.formulario} + ${mapping.modalidade} → ${mapping.template?.nome}`);
    });
    
    return mappings;
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      console.error(`Erro do serviço: ${error.message} (${error.code})`);
    } else {
      console.error('Erro inesperado:', error);
    }
    return [];
  }
}

// Exemplo 4: Buscar template com sistema de fallback
export async function exemploFindWithFallback() {
  try {
    console.log('=== Exemplo: Buscar template com fallback ===');
    
    // Buscar template para Comply Fiscal + SaaS (pode não existir)
    const result = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'saas');
    
    if (result.template) {
      console.log(`Template encontrado: ${result.template.nome}`);
      
      if (result.mappingFound) {
        console.log('✅ Template específico para a combinação encontrado');
      } else if (result.isDefault) {
        console.log('⚠️ Usando template padrão (fallback)');
      } else {
        console.log('⚠️ Usando template genérico (último recurso)');
      }
    } else {
      console.log('❌ Nenhum template encontrado, nem mesmo fallback');
    }
    
    return result;
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      console.error(`Erro do serviço: ${error.message} (${error.code})`);
    } else {
      console.error('Erro inesperado:', error);
    }
    return { template: null, isDefault: false, mappingFound: false };
  }
}

// Exemplo 5: Integração com formulário (simulação)
export async function exemploIntegracaoFormulario(
  formulario: 'comply_edocs' | 'comply_fiscal',
  modalidade: 'on-premise' | 'saas',
  dadosFormulario: any
) {
  try {
    console.log('=== Exemplo: Integração com formulário ===');
    console.log(`Processando formulário: ${formulario} (${modalidade})`);
    
    // 1. Buscar template com fallback
    const result = await emailTemplateMappingService.findWithFallback(formulario, modalidade);
    
    if (!result.template) {
      throw new Error('Nenhum template disponível para envio de e-mail');
    }
    
    // 2. Log do tipo de template usado
    if (result.mappingFound) {
      console.log('📧 Usando template específico para a combinação');
    } else {
      console.log('📧 Usando template padrão (fallback)');
    }
    
    // 3. Preparar dados do e-mail
    const emailData = {
      template: result.template,
      destinatario: dadosFormulario.email,
      assunto: result.template.assunto,
      corpo: result.template.corpo,
      isDefault: result.isDefault
    };
    
    console.log(`E-mail preparado para: ${emailData.destinatario}`);
    console.log(`Template usado: ${emailData.template.nome}`);
    
    // Aqui seria feita a integração com o emailService para envio
    // await emailService.sendEmail(emailData);
    
    return emailData;
  } catch (error) {
    console.error('Erro na integração com formulário:', error);
    throw error;
  }
}

// Exemplo 6: Verificar template por ID
export async function exemploGetTemplateById(templateId: string) {
  try {
    console.log('=== Exemplo: Buscar template por ID ===');
    
    const template = await emailTemplateMappingService.getTemplateById(templateId);
    
    if (template) {
      console.log(`Template encontrado: ${template.nome}`);
      console.log(`Status: ${template.ativo ? 'Ativo' : 'Inativo'}`);
      console.log(`Vinculado ao formulário: ${template.vinculado_formulario ? 'Sim' : 'Não'}`);
    } else {
      console.log('Template não encontrado ou inativo');
    }
    
    return template;
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      console.error(`Erro do serviço: ${error.message} (${error.code})`);
    } else {
      console.error('Erro inesperado:', error);
    }
    return null;
  }
}

// Função para executar todos os exemplos
export async function executarTodosExemplos() {
  console.log('🚀 Executando exemplos do EmailTemplateMappingService\n');
  
  await exemploFindByMapping();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await exemploValidateUniqueness();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await exemploGetMappingsList();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await exemploFindWithFallback();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Exemplo de integração com dados simulados
  const dadosSimulados = {
    email: 'teste@empresa.com',
    razaoSocial: 'Empresa Teste Ltda',
    responsavel: 'João Silva'
  };
  
  await exemploIntegracaoFormulario('comply_edocs', 'saas', dadosSimulados);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Exemplo com ID fictício
  await exemploGetTemplateById('123e4567-e89b-12d3-a456-426614174000');
  
  console.log('\n✅ Todos os exemplos executados!');
}

// Para usar em desenvolvimento/debug:
// import { executarTodosExemplos } from './emailTemplateMappingService.example';
// executarTodosExemplos();