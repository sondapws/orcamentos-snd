/**
 * Exemplos de uso do sistema de mapeamento de templates de e-mail
 * 
 * Este arquivo contém exemplos práticos de como usar o sistema de mapeamento
 * em diferentes cenários comuns.
 */

import React, { useState, useEffect } from 'react';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';
import { useTemplateMappingValidation } from '@/hooks/useTemplateMappingValidation';
import type { EmailTemplate } from '@/types/approval';

// ============================================================================
// EXEMPLO 1: Uso básico em formulário
// ============================================================================

/**
 * Exemplo de integração básica com formulário
 * Demonstra como identificar e usar o template correto
 */
export const BasicFormIntegrationExample: React.FC = () => {
  const { findWithFallback, loading } = useEmailTemplateMapping();
  const [selectedModalidade, setSelectedModalidade] = useState<'on-premise' | 'saas'>('on-premise');
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [fallbackInfo, setFallbackInfo] = useState<string>('');

  const handleFormSubmit = async (formData: any) => {
    try {
      // Identificar formulário (normalmente baseado na rota ou contexto)
      const formulario = 'comply_fiscal'; // ou 'comply_edocs'
      
      // Buscar template apropriado com fallback
      const result = await findWithFallback(formulario, selectedModalidade);
      
      if (result.template) {
        setTemplate(result.template);
        
        // Informar sobre uso de fallback
        if (result.isDefault) {
          setFallbackInfo(`Fallback usado: ${result.fallbackType} - ${result.fallbackReason}`);
        } else {
          setFallbackInfo('Template específico encontrado');
        }
        
        // Aqui você usaria o template para gerar o e-mail
        console.log('Template a ser usado:', result.template.nome);
        
        // Exemplo de uso do template
        await sendEmailWithTemplate(result.template, formData);
        
      } else {
        throw new Error('Nenhum template disponível para esta combinação');
      }
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      setFallbackInfo(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Exemplo: Integração Básica com Formulário</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Modalidade:</label>
          <select 
            value={selectedModalidade} 
            onChange={(e) => setSelectedModalidade(e.target.value as 'on-premise' | 'saas')}
            className="border rounded px-3 py-2"
          >
            <option value="on-premise">On-premisse</option>
            <option value="saas">SaaS</option>
          </select>
        </div>
        
        <button 
          onClick={() => handleFormSubmit({ modalidade: selectedModalidade })}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Simular Envio'}
        </button>
        
        {template && (
          <div className="bg-green-50 p-3 rounded">
            <p><strong>Template selecionado:</strong> {template.nome}</p>
            <p><strong>Assunto:</strong> {template.assunto}</p>
          </div>
        )}
        
        {fallbackInfo && (
          <div className="bg-blue-50 p-3 rounded">
            <p><strong>Info:</strong> {fallbackInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXEMPLO 2: Validação em tempo real
// ============================================================================

/**
 * Exemplo de validação em tempo real durante criação/edição de template
 */
export const RealTimeValidationExample: React.FC = () => {
  const [formulario, setFormulario] = useState<'comply_edocs' | 'comply_fiscal'>('comply_fiscal');
  const [modalidade, setModalidade] = useState<'on-premise' | 'saas'>('on-premise');
  const [templateId, setTemplateId] = useState('');

  const {
    validateMapping,
    validationState,
    isValidating,
    hasError,
    errorMessage,
    clearValidation
  } = useTemplateMappingValidation({
    showToasts: true,
    autoValidate: true,
    validationDelay: 500
  });

  // Validar automaticamente quando os valores mudam
  useEffect(() => {
    if (templateId) {
      validateMapping({
        formulario,
        modalidade,
        templateId
      });
    } else {
      clearValidation();
    }
  }, [formulario, modalidade, templateId, validateMapping, clearValidation]);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Exemplo: Validação em Tempo Real</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Formulário:</label>
          <select 
            value={formulario} 
            onChange={(e) => setFormulario(e.target.value as 'comply_edocs' | 'comply_fiscal')}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="comply_fiscal">Comply Fiscal</option>
            <option value="comply_edocs">Comply e-DOCS</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Modalidade:</label>
          <select 
            value={modalidade} 
            onChange={(e) => setModalidade(e.target.value as 'on-premise' | 'saas')}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="on-premise">On-premisse</option>
            <option value="saas">SaaS</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">ID do Template:</label>
          <input
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            placeholder="Digite o ID do template"
            className={`border rounded px-3 py-2 w-full ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        
        {/* Indicador de validação */}
        <div className="flex items-center space-x-2">
          {isValidating && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Validando...
            </div>
          )}
          
          {!isValidating && validationState.isValid && templateId && (
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Mapeamento válido
            </div>
          )}
          
          {hasError && (
            <div className="flex items-center text-red-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXEMPLO 3: Configuração de fallback
// ============================================================================

/**
 * Exemplo de configuração do sistema de fallback
 */
export const FallbackConfigurationExample: React.FC = () => {
  const [config, setConfig] = useState(emailTemplateMappingService.getFallbackConfig());
  const [status, setStatus] = useState<string>('');

  const updateConfig = (updates: any) => {
    try {
      emailTemplateMappingService.updateFallbackConfig(updates);
      setConfig(emailTemplateMappingService.getFallbackConfig());
      setStatus('Configuração atualizada com sucesso');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const setDefaultTemplate = async (formulario: 'comply_edocs' | 'comply_fiscal', templateId: string) => {
    try {
      const success = await emailTemplateMappingService.setDefaultTemplate(formulario, templateId);
      if (success) {
        setConfig(emailTemplateMappingService.getFallbackConfig());
        setStatus(`Template padrão configurado para ${formulario}`);
      } else {
        setStatus('Template não encontrado ou inativo');
      }
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Exemplo: Configuração de Fallback</h3>
      
      <div className="space-y-6">
        {/* Status */}
        {status && (
          <div className={`p-3 rounded ${status.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {status}
          </div>
        )}
        
        {/* Configurações de comportamento */}
        <div>
          <h4 className="font-medium mb-3">Comportamentos</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.useAnyActiveTemplateAsFallback}
                onChange={(e) => updateConfig({ useAnyActiveTemplateAsFallback: e.target.checked })}
                className="mr-2"
              />
              Usar qualquer template ativo como fallback
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.failWhenNoTemplateFound}
                onChange={(e) => updateConfig({ failWhenNoTemplateFound: e.target.checked })}
                className="mr-2"
              />
              Falhar quando nenhum template for encontrado
            </label>
          </div>
        </div>
        
        {/* Configurações de log */}
        <div>
          <h4 className="font-medium mb-3">Logs</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableLogging}
                onChange={(e) => updateConfig({ enableLogging: e.target.checked })}
                className="mr-2"
              />
              Habilitar logs
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.logFallbackUsage}
                onChange={(e) => updateConfig({ logFallbackUsage: e.target.checked })}
                className="mr-2"
              />
              Log de uso de fallback
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.logMappingNotFound}
                onChange={(e) => updateConfig({ logMappingNotFound: e.target.checked })}
                className="mr-2"
              />
              Log quando mapeamento não for encontrado
            </label>
          </div>
        </div>
        
        {/* Templates padrão */}
        <div>
          <h4 className="font-medium mb-3">Templates Padrão</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Comply Fiscal:</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="ID do template padrão"
                  className="border rounded px-3 py-2 flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setDefaultTemplate('comply_fiscal', (e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <span className="text-sm text-gray-500 self-center">
                  Atual: {config.defaultTemplates?.comply_fiscal || 'Não configurado'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Comply e-DOCS:</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="ID do template padrão"
                  className="border rounded px-3 py-2 flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setDefaultTemplate('comply_edocs', (e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <span className="text-sm text-gray-500 self-center">
                  Atual: {config.defaultTemplates?.comply_edocs || 'Não configurado'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Template global */}
        <div>
          <h4 className="font-medium mb-3">Template Global de Fallback</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="ID do template global"
              className="border rounded px-3 py-2 flex-1"
              onKeyPress={async (e) => {
                if (e.key === 'Enter') {
                  const success = await emailTemplateMappingService.setGlobalFallbackTemplate(
                    (e.target as HTMLInputElement).value
                  );
                  if (success) {
                    setConfig(emailTemplateMappingService.getFallbackConfig());
                    setStatus('Template global configurado');
                  } else {
                    setStatus('Template não encontrado ou inativo');
                  }
                  setTimeout(() => setStatus(''), 3000);
                }
              }}
            />
            <span className="text-sm text-gray-500 self-center">
              Atual: {config.globalFallbackTemplate || 'Não configurado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXEMPLO 4: Listagem e gerenciamento de mapeamentos
// ============================================================================

/**
 * Exemplo de listagem e gerenciamento de mapeamentos
 */
export const MappingManagementExample: React.FC = () => {
  const { getMappingsList, loading } = useEmailTemplateMapping();
  const [mappings, setMappings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    try {
      const mappingsList = await getMappingsList();
      setMappings(mappingsList);
    } catch (error) {
      console.error('Erro ao carregar mapeamentos:', error);
    }
  };

  const filteredMappings = mappings.filter(mapping => {
    if (filter === 'all') return true;
    return mapping.formulario === filter;
  });

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Exemplo: Gerenciamento de Mapeamentos</h3>
      
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filtrar por formulário:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="comply_fiscal">Comply Fiscal</option>
            <option value="comply_edocs">Comply e-DOCS</option>
          </select>
          
          <button 
            onClick={loadMappings}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
        
        {/* Lista de mapeamentos */}
        <div className="border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Formulário</th>
                <th className="px-4 py-2 text-left">Modalidade</th>
                <th className="px-4 py-2 text-left">Template</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMappings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Carregando...' : 'Nenhum mapeamento encontrado'}
                  </td>
                </tr>
              ) : (
                filteredMappings.map((mapping, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {mapping.formulario === 'comply_fiscal' ? 'Comply Fiscal' : 'Comply e-DOCS'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {mapping.modalidade === 'on-premise' ? 'On-premisse' : 'SaaS'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">{mapping.template?.nome || 'Template não encontrado'}</div>
                        <div className="text-sm text-gray-500">ID: {mapping.templateId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        mapping.template?.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mapping.template?.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Estatísticas */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{mappings.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {mappings.filter(m => m.template?.ativo).length}
              </div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {mappings.filter(m => !m.template?.ativo).length}
              </div>
              <div className="text-sm text-gray-600">Inativos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FUNÇÃO AUXILIAR
// ============================================================================

/**
 * Função auxiliar para simular envio de e-mail com template
 * Em um cenário real, esta função integraria com o serviço de e-mail
 */
async function sendEmailWithTemplate(template: EmailTemplate, formData: any): Promise<void> {
  console.log('Enviando e-mail com template:', {
    templateId: template.id,
    templateName: template.nome,
    subject: template.assunto,
    formData
  });
  
  // Simular delay de envio
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('E-mail enviado com sucesso!');
}

// ============================================================================
// COMPONENTE PRINCIPAL COM TODOS OS EXEMPLOS
// ============================================================================

/**
 * Componente principal que demonstra todos os exemplos
 */
export const EmailTemplateMappingExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Exemplos de Uso - Email Template Mapping</h1>
        <p className="text-gray-600">
          Demonstrações práticas de como usar o sistema de mapeamento de templates de e-mail
        </p>
      </div>
      
      <BasicFormIntegrationExample />
      <RealTimeValidationExample />
      <FallbackConfigurationExample />
      <MappingManagementExample />
    </div>
  );
};

export default EmailTemplateMappingExamples;