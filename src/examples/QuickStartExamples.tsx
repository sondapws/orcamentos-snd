/**
 * Exemplos de início rápido para o sistema de mapeamento de templates
 * 
 * Este arquivo contém exemplos simples e diretos para começar a usar
 * o sistema de mapeamento de templates de e-mail rapidamente.
 */

import React, { useState } from 'react';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';
import { useTemplateMappingValidation } from '@/hooks/useTemplateMappingValidation';

// ============================================================================
// EXEMPLO 1: Uso mais simples possível
// ============================================================================

/**
 * Exemplo mais básico - buscar e usar template
 */
export const SimpleExample = async () => {
    // Buscar template com fallback automático
    const result = await emailTemplateMappingService.findWithFallback(
        'comply_fiscal',
        'on-premise'
    );

    if (result.template) {
        console.log('Template encontrado:', result.template.nome);
        // Usar template aqui
    } else {
        console.log('Nenhum template disponível');
    }
};

// ============================================================================
// EXEMPLO 2: Hook básico em componente React
// ============================================================================

/**
 * Uso básico do hook em componente React
 */
export const BasicHookExample: React.FC = () => {
    const { findWithFallback, loading } = useEmailTemplateMapping();

    const handleClick = async () => {
        const result = await findWithFallback('comply_fiscal', 'saas');

        if (result.template) {
            alert(`Template: ${result.template.nome}`);
        }
    };

    return (
        <button onClick={handleClick} disabled={loading}>
            {loading ? 'Carregando...' : 'Buscar Template'}
        </button>
    );
};

// ============================================================================
// EXEMPLO 3: Validação simples
// ============================================================================

/**
 * Validação básica de mapeamento
 */
export const SimpleValidationExample = async () => {
    // Verificar se combinação é única
    const isUnique = await emailTemplateMappingService.validateUniqueness(
        'comply_fiscal',
        'on-premise'
    );

    if (isUnique) {
        console.log('Pode criar novo mapeamento');
    } else {
        console.log('Já existe mapeamento para esta combinação');
    }
};

// ============================================================================
// EXEMPLO 4: Listar mapeamentos
// ============================================================================

/**
 * Listar todos os mapeamentos existentes
 */
export const ListMappingsExample = async () => {
    const mappings = await emailTemplateMappingService.getMappingsList();

    console.log(`Total de mapeamentos: ${mappings.length}`);

    mappings.forEach(mapping => {
        console.log(`${mapping.formulario} + ${mapping.modalidade} → ${mapping.template?.nome}`);
    });
};

// ============================================================================
// EXEMPLO 5: Configuração básica de fallback
// ============================================================================

/**
 * Configurar sistema de fallback básico
 */
export const BasicFallbackSetup = async () => {
    // Definir template padrão para Comply Fiscal
    await emailTemplateMappingService.setDefaultTemplate(
        'comply_fiscal',
        'template-fiscal-default-id'
    );

    // Definir template global de fallback
    await emailTemplateMappingService.setGlobalFallbackTemplate(
        'template-global-id'
    );

    // Habilitar logs
    emailTemplateMappingService.updateFallbackConfig({
        logging: {
            enabled: true,
            logFallbackUsage: true,
            logMappingNotFound: true
        }
    });

    console.log('Fallback configurado!');
};

// ============================================================================
// EXEMPLO 6: Formulário com template automático
// ============================================================================

/**
 * Formulário que seleciona template automaticamente
 */
export const AutoTemplateForm: React.FC = () => {
    const [modalidade, setModalidade] = useState<'on-premise' | 'saas'>('on-premise');
    const { findWithFallback } = useEmailTemplateMapping();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Identificar formulário (normalmente baseado na rota)
        const formulario = 'comply_fiscal';

        // Buscar template apropriado
        const result = await findWithFallback(formulario, modalidade);

        if (result.template) {
            console.log('Enviando e-mail com template:', result.template.nome);

            // Aqui você enviaria o e-mail usando o template
            // await sendEmail(result.template, formData);

            alert('E-mail enviado com sucesso!');
        } else {
            alert('Erro: Nenhum template disponível');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Modalidade:</label>
                <select
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value as any)}
                >
                    <option value="on-premise">On-premise</option>
                    <option value="saas">SaaS</option>
                </select>
            </div>

            <button type="submit">Enviar E-mail</button>
        </form>
    );
};

// ============================================================================
// EXEMPLO 7: Validação em tempo real
// ============================================================================

/**
 * Campo com validação em tempo real
 */
export const RealTimeValidationField: React.FC = () => {
    const [templateId, setTemplateId] = useState('');

    const {
        validateMapping,
        hasError,
        errorMessage,
        isValidating
    } = useTemplateMappingValidation({
        autoValidate: true,
        validationDelay: 300
    });

    // Validar quando templateId muda
    React.useEffect(() => {
        if (templateId) {
            validateMapping({
                formulario: 'comply_fiscal',
                modalidade: 'on-premise',
                excludeId: templateId
            });
        }
    }, [templateId, validateMapping]);

    return (
        <div>
            <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="Digite o ID do template"
                style={{ borderColor: hasError ? 'red' : 'gray' }}
            />

            {isValidating && <span>Validando...</span>}
            {hasError && <span style={{ color: 'red' }}>{errorMessage}</span>}
            {!hasError && !isValidating && templateId && (
                <span style={{ color: 'green' }}>✓ Válido</span>
            )}
        </div>
    );
};

// ============================================================================
// EXEMPLO 8: Tratamento de erros
// ============================================================================

/**
 * Exemplo de tratamento de erros
 */
export const ErrorHandlingExample = async () => {
    try {
        const result = await emailTemplateMappingService.findWithFallback(
            'comply_fiscal',
            'on-premise'
        );

        if (result.template) {
            console.log('Sucesso:', result.template.nome);
        } else {
            console.log('Nenhum template encontrado');
        }

    } catch (error) {
        if (error instanceof Error) {
            console.error('Erro:', error.message);

            // Tratar diferentes tipos de erro
            if (error.message.includes('database')) {
                console.log('Problema de conexão com banco');
            } else if (error.message.includes('template')) {
                console.log('Problema com template');
            }
        }
    }
};

// ============================================================================
// EXEMPLO 9: Verificar status do sistema
// ============================================================================

/**
 * Verificar se o sistema está funcionando
 */
export const SystemHealthCheck = async () => {
    try {
        // Testar busca de mapeamentos
        const mappings = await emailTemplateMappingService.getMappingsList();
        console.log(`✓ Sistema OK - ${mappings.length} mapeamentos encontrados`);

        // Testar busca com fallback
        const result = await emailTemplateMappingService.findWithFallback(
            'comply_fiscal',
            'on-premise'
        );

        if (result.template) {
            console.log('✓ Fallback funcionando');
        } else {
            console.log('⚠ Nenhum template disponível');
        }

        // Verificar configuração
        const config = emailTemplateMappingService.getFallbackConfig();
        console.log('✓ Configuração carregada:', config);

        return true;

    } catch (error) {
        console.error('❌ Sistema com problemas:', error);
        return false;
    }
};

// ============================================================================
// EXEMPLO 10: Setup inicial completo
// ============================================================================

/**
 * Setup inicial completo do sistema
 */
export const InitialSetup = async () => {
    console.log('Configurando sistema de mapeamento de templates...');

    try {
        // 1. Verificar se há mapeamentos
        const mappings = await emailTemplateMappingService.getMappingsList();
        console.log(`Mapeamentos existentes: ${mappings.length}`);

        // 2. Configurar templates padrão se necessário
        if (mappings.length === 0) {
            console.log('Nenhum mapeamento encontrado. Configure templates padrão.');
        }

        // 3. Configurar fallback básico
        emailTemplateMappingService.updateFallbackConfig({
            logging: {
                enabled: true,
                logFallbackUsage: true,
                logMappingNotFound: true
            },
            behavior: {
                useAnyActiveTemplateAsFallback: true,
                failWhenNoTemplateFound: false
            }
        });

        // 4. Testar sistema
        const isHealthy = await SystemHealthCheck();

        if (isHealthy) {
            console.log('✅ Sistema configurado e funcionando!');
        } else {
            console.log('❌ Problemas na configuração');
        }

    } catch (error) {
        console.error('Erro durante setup:', error);
    }
};

// ============================================================================
// COMPONENTE DEMO COMPLETO
// ============================================================================

/**
 * Componente demo que mostra funcionalidades básicas
 */
export const QuickStartDemo: React.FC = () => {
    const [result, setResult] = useState<string>('');
    const { findWithFallback, getMappingsList, loading } = useEmailTemplateMapping();

    const testFindTemplate = async () => {
        const result = await findWithFallback('comply_fiscal', 'on-premise');
        setResult(`Template: ${result.template?.nome || 'Nenhum'} (${result.fallbackType})`);
    };

    const testListMappings = async () => {
        const mappings = await getMappingsList();
        setResult(`${mappings.length} mapeamentos encontrados`);
    };

    const testValidation = async () => {
        const isUnique = await emailTemplateMappingService.validateUniqueness(
            'comply_fiscal',
            'saas'
        );
        setResult(`Combinação única: ${isUnique ? 'Sim' : 'Não'}`);
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Demo - Sistema de Mapeamento de Templates</h3>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={testFindTemplate} disabled={loading} style={{ marginRight: '10px' }}>
                    Buscar Template
                </button>

                <button onClick={testListMappings} disabled={loading} style={{ marginRight: '10px' }}>
                    Listar Mapeamentos
                </button>

                <button onClick={testValidation} disabled={loading}>
                    Testar Validação
                </button>
            </div>

            {loading && <p>Carregando...</p>}

            {result && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    marginTop: '10px'
                }}>
                    <strong>Resultado:</strong> {result}
                </div>
            )}

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>Este demo mostra as funcionalidades básicas do sistema:</p>
                <ul>
                    <li>Buscar template com fallback automático</li>
                    <li>Listar todos os mapeamentos configurados</li>
                    <li>Validar se uma combinação é única</li>
                </ul>
            </div>
        </div>
    );
};

// ============================================================================
// EXPORTAÇÕES PARA USO RÁPIDO
// ============================================================================

// Funções utilitárias para uso direto
export const quickStart = {
    // Buscar template (mais comum)
    findTemplate: async (formulario: 'comply_fiscal' | 'comply_edocs', modalidade: 'on-premise' | 'saas') => {
        return await emailTemplateMappingService.findWithFallback(formulario, modalidade);
    },

    // Validar mapeamento
    validateMapping: async (formulario: 'comply_fiscal' | 'comply_edocs', modalidade: 'on-premise' | 'saas') => {
        return await emailTemplateMappingService.validateUniqueness(formulario, modalidade);
    },

    // Listar mapeamentos
    listMappings: async () => {
        return await emailTemplateMappingService.getMappingsList();
    },

    // Configurar fallback básico
    setupFallback: () => {
        emailTemplateMappingService.updateFallbackConfig({
            logging: {
                enabled: true,
                logFallbackUsage: true,
                logMappingNotFound: true
            },
            behavior: {
                useAnyActiveTemplateAsFallback: true,
                failWhenNoTemplateFound: false
            }
        });
    },

    // Verificar saúde do sistema
    healthCheck: SystemHealthCheck
};

export default QuickStartDemo;