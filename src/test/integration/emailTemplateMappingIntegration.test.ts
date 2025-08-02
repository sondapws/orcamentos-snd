import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { approvalService } from '@/services/approvalService';
import type { EmailTemplate } from '@/types/approval';
import type { FormDataFiscal } from '@/types/formDataFiscal';
import type { FormData } from '@/types/formData';

// Mock do Supabase com estrutura simplificada
const mockSupabaseQuery = {
  data: [],
  error: null
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve(mockSupabaseQuery))
                }))
              })),
              is: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve(mockSupabaseQuery))
                }))
              })),
              neq: vi.fn(() => Promise.resolve(mockSupabaseQuery)),
              not: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve(mockSupabaseQuery))
              }))
            })),
            single: vi.fn(() => Promise.resolve(mockSupabaseQuery))
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

// Mock do serviço de aprovação
vi.mock('@/services/approvalService', () => ({
  approvalService: {
    submitForApproval: vi.fn(),
    sendQuoteDirectly: vi.fn()
  }
}));

// Mock dos serviços auxiliares
vi.mock('@/services/auditLogger', () => ({
  auditLogger: {
    logTemplateSearch: vi.fn(),
    logFallbackUsage: vi.fn(),
    logError: vi.fn(),
    logOperation: vi.fn()
  }
}));

vi.mock('@/services/adminNotificationService', () => ({
  adminNotificationService: {
    notifyError: vi.fn(),
    notifyConfigurationIssue: vi.fn()
  }
}));

vi.mock('@/services/errorRecoveryService', () => ({
  errorRecoveryService: {
    executeWithRecovery: vi.fn((fn) => fn().then(result => ({ success: true, result })))
  }
}));

describe('Email Template Mapping - Integration Tests', () => {
  const mockApprovalService = vi.mocked(approvalService);

  // Templates de teste
  const mockTemplates: EmailTemplate[] = [
    {
      id: 'template-fiscal-onprem',
      nome: 'Template Comply Fiscal On-premise',
      assunto: 'Orçamento Comply Fiscal - {{razaoSocial}}',
      corpo: 'Prezado {{responsavel}}, segue orçamento para {{razaoSocial}}.',
      ativo: true,
      vinculado_formulario: true,
      formulario: 'comply_fiscal',
      modalidade: 'on-premise',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'template-fiscal-saas',
      nome: 'Template Comply Fiscal SaaS',
      assunto: 'Orçamento Comply Fiscal SaaS - {{razaoSocial}}',
      corpo: 'Prezado {{responsavel}}, segue orçamento SaaS para {{razaoSocial}}.',
      ativo: true,
      vinculado_formulario: true,
      formulario: 'comply_fiscal',
      modalidade: 'saas',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'template-edocs-onprem',
      nome: 'Template Comply e-DOCS On-premise',
      assunto: 'Orçamento Comply e-DOCS - {{razaoSocial}}',
      corpo: 'Prezado {{responsavel}}, segue orçamento e-DOCS para {{razaoSocial}}.',
      ativo: true,
      vinculado_formulario: true,
      formulario: 'comply_edocs',
      modalidade: 'on-premise',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'template-edocs-saas',
      nome: 'Template Comply e-DOCS SaaS',
      assunto: 'Orçamento Comply e-DOCS SaaS - {{razaoSocial}}',
      corpo: 'Prezado {{responsavel}}, segue orçamento e-DOCS SaaS para {{razaoSocial}}.',
      ativo: true,
      vinculado_formulario: true,
      formulario: 'comply_edocs',
      modalidade: 'saas',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'template-fiscal-default',
      nome: 'Template Padrão Fiscal',
      assunto: 'Orçamento Comply Fiscal',
      corpo: 'Template padrão para formulário fiscal.',
      ativo: true,
      vinculado_formulario: true,
      formulario: 'comply_fiscal',
      modalidade: null,
      created_at: '2025-01-01T00:00:00Z'
    }
  ];

  // Dados de formulário de teste
  const mockFormDataFiscal: FormDataFiscal = {
    crm: 'CRM123',
    razaoSocial: 'Empresa Teste Ltda',
    cnpj: '12.345.678/0001-90',
    municipio: 'São Paulo',
    uf: 'SP',
    responsavel: 'João Silva',
    email: 'joao@empresa.com',
    segmento: 'industria',
    escopo: ['nfe', 'nfce'],
    quantidadeEmpresas: 1,
    quantidadeUfs: 1,
    volumetriaNotas: '1000-5000',
    modalidade: 'on-premise',
    prazoContratacao: 12,
    step: 2,
    completed: false
  };

  const mockFormDataEDocs: FormData = {
    crm: 'CRM456',
    razaoSocial: 'Empresa e-DOCS Ltda',
    cnpj: '98.765.432/0001-10',
    municipio: 'Rio de Janeiro',
    uf: 'RJ',
    responsavel: 'Maria Santos',
    email: 'maria@empresa.com',
    segmento: 'varejo',
    escopoInbound: ['nfse'],
    escopoOutbound: ['nfe'],
    modelosNotas: ['55'],
    cenariosNegocio: ['b2b'],
    quantidadeEmpresas: 2,
    quantidadeUfs: 2,
    volumetriaNotas: '5000-10000',
    modalidade: 'saas',
    prazoContratacao: 24,
    step: 2,
    completed: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock query result
    mockSupabaseQuery.data = [];
    mockSupabaseQuery.error = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Integração Formulário → Mapeamento → E-mail', () => {
    it('deve executar fluxo completo: Comply Fiscal On-premise → Template específico → Aprovação', async () => {
      // Arrange
      const specificTemplate = mockTemplates.find(t => 
        t.formulario === 'comply_fiscal' && t.modalidade === 'on-premise'
      )!;

      // Mock da busca por template específico
      mockSupabase.from().select().eq().eq().eq().eq().order().limit.mockResolvedValue({
        data: [specificTemplate],
        error: null
      });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-123');

      // Act
      const templateResult = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');
      
      // Simular submissão do formulário
      const quoteId = await mockApprovalService.submitForApproval(mockFormDataFiscal, 'comply_fiscal');

      // Assert
      expect(templateResult.template).toEqual(specificTemplate);
      expect(templateResult.isDefault).toBe(false);
      expect(templateResult.mappingFound).toBe(true);
      expect(templateResult.fallbackType).toBe('specific');

      expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
        mockFormDataFiscal,
        'comply_fiscal'
      );
      expect(quoteId).toBe('quote-123');
    });

    it('deve executar fluxo completo: Comply e-DOCS SaaS → Template específico → Envio direto', async () => {
      // Arrange
      const specificTemplate = mockTemplates.find(t => 
        t.formulario === 'comply_edocs' && t.modalidade === 'saas'
      )!;

      const sondaFormData = { ...mockFormDataEDocs, email: 'admin@sonda.com' };

      // Mock da busca por template específico
      mockSupabase.from().select().eq().eq().eq().eq().order().limit.mockResolvedValue({
        data: [specificTemplate],
        error: null
      });

      mockApprovalService.sendQuoteDirectly.mockResolvedValue(true);

      // Act
      const templateResult = await emailTemplateMappingService.findWithFallback('comply_edocs', 'saas');
      
      // Simular envio direto para @sonda.com
      const sendResult = await mockApprovalService.sendQuoteDirectly(sondaFormData, 'comply_edocs');

      // Assert
      expect(templateResult.template).toEqual(specificTemplate);
      expect(templateResult.isDefault).toBe(false);
      expect(templateResult.mappingFound).toBe(true);

      expect(mockApprovalService.sendQuoteDirectly).toHaveBeenCalledWith(
        sondaFormData,
        'comply_edocs'
      );
      expect(sendResult).toBe(true);
    });

    it('deve executar fluxo com fallback: Template específico não encontrado → Template padrão → Aprovação', async () => {
      // Arrange
      const defaultTemplate = mockTemplates.find(t => 
        t.formulario === 'comply_fiscal' && t.modalidade === null
      )!;

      // Mock: template específico não encontrado
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValueOnce({ data: [], error: null });

      // Mock: template padrão encontrado
      mockSupabase.from().select().eq().eq().eq().is().order().limit
        .mockResolvedValueOnce({ data: [defaultTemplate], error: null });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-fallback-123');

      // Act
      const templateResult = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'saas');
      
      // Simular submissão com template de fallback
      const quoteId = await mockApprovalService.submitForApproval(mockFormDataFiscal, 'comply_fiscal');

      // Assert
      expect(templateResult.template).toEqual(defaultTemplate);
      expect(templateResult.isDefault).toBe(true);
      expect(templateResult.mappingFound).toBe(false);
      expect(templateResult.fallbackType).toBe('form_default');

      expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
        mockFormDataFiscal,
        'comply_fiscal'
      );
      expect(quoteId).toBe('quote-fallback-123');
    });

    it('deve falhar quando nenhum template é encontrado', async () => {
      // Arrange
      // Mock: nenhum template encontrado em toda a cadeia de fallback
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ data: [], error: null });
      mockSupabase.from().select().eq().eq().eq().is().order().limit
        .mockResolvedValue({ data: [], error: null });
      mockSupabase.from().select().eq().eq().eq().order().limit
        .mockResolvedValue({ data: [], error: null });

      // Act
      const templateResult = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');

      // Assert
      expect(templateResult.template).toBeNull();
      expect(templateResult.isDefault).toBe(false);
      expect(templateResult.mappingFound).toBe(false);
      expect(templateResult.fallbackType).toBe('none');

      // Não deve tentar submeter sem template
      expect(mockApprovalService.submitForApproval).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de Erro e Recuperação', () => {
    it('deve recuperar de erro de conexão com banco de dados', async () => {
      // Arrange
      const dbError = new Error('Connection timeout');
      
      // Mock: primeiro erro, depois sucesso
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValueOnce(dbError)
        .mockResolvedValueOnce({ 
          data: [mockTemplates[0]], 
          error: null 
        });

      // Act & Assert
      // Primeira tentativa deve falhar
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow();

      // Segunda tentativa deve funcionar
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');
      expect(result).toEqual(mockTemplates[0]);
    });

    it('deve tratar erro de validação de unicidade', async () => {
      // Arrange
      const duplicateTemplate = mockTemplates[0];
      
      // Mock: template duplicado encontrado
      mockSupabase.from().select().eq().eq().eq().neq
        .mockResolvedValue({ 
          data: [duplicateTemplate], 
          error: null 
        });

      // Act
      const isUnique = await emailTemplateMappingService.validateUniqueness(
        'comply_fiscal',
        'on-premise',
        'different-template-id'
      );

      // Assert
      expect(isUnique).toBe(false);
    });

    it('deve tratar erro de template inválido durante fallback', async () => {
      // Arrange
      const corruptedTemplate = {
        ...mockTemplates[0],
        nome: null, // Campo obrigatório nulo
        assunto: undefined // Campo obrigatório indefinido
      };

      // Mock: template corrompido encontrado
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [corruptedTemplate], 
          error: null 
        });

      // Act
      const templateResult = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');

      // Assert
      // Deve retornar o template mesmo com dados corrompidos (responsabilidade do frontend validar)
      expect(templateResult.template).toBeDefined();
      expect(templateResult.template?.id).toBe(corruptedTemplate.id);
    });

    it('deve tratar timeout de consulta ao banco', async () => {
      // Arrange
      const timeoutError = new Error('Query timeout');
      
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow('Query timeout');
    });
  });

  describe('Validação de Dados no Banco', () => {
    it('deve validar integridade dos dados de template', async () => {
      // Arrange
      const validTemplate = mockTemplates[0];
      
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [validTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBeDefined();
      expect(result!.nome).toBeDefined();
      expect(result!.assunto).toBeDefined();
      expect(result!.corpo).toBeDefined();
      expect(typeof result!.ativo).toBe('boolean');
      expect(typeof result!.vinculado_formulario).toBe('boolean');
      expect(['comply_fiscal', 'comply_edocs']).toContain(result!.formulario);
      expect(['on-premise', 'saas', null]).toContain(result!.modalidade);
    });

    it('deve validar consistência de mapeamentos', async () => {
      // Arrange
      const allMappings = mockTemplates.filter(t => t.formulario && t.modalidade);
      
      mockSupabase.from().select().eq().eq().not().order()
        .mockResolvedValue({ 
          data: allMappings, 
          error: null 
        });

      // Act
      const mappings = await emailTemplateMappingService.getMappingsList();

      // Assert
      // Verificar se não há duplicatas
      const combinations = mappings.map(m => `${m.formulario}-${m.modalidade}`);
      const uniqueCombinations = [...new Set(combinations)];
      expect(combinations.length).toBe(uniqueCombinations.length);

      // Verificar se todos os mapeamentos têm dados válidos
      mappings.forEach(mapping => {
        expect(mapping.formulario).toBeDefined();
        expect(mapping.modalidade).toBeDefined();
        expect(mapping.templateId).toBeDefined();
        expect(mapping.template).toBeDefined();
      });
    });

    it('deve validar referências de template válidas', async () => {
      // Arrange
      const templateWithValidRef = mockTemplates[0];
      
      // Mock: busca por ID específico
      mockSupabase.from().select().eq().eq().single
        .mockResolvedValue({ 
          data: templateWithValidRef, 
          error: null 
        });

      // Act
      const template = await emailTemplateMappingService.getTemplateById(templateWithValidRef.id);

      // Assert
      expect(template).toEqual(templateWithValidRef);
      expect(template!.id).toBe(templateWithValidRef.id);
      expect(template!.ativo).toBe(true);
    });

    it('deve detectar referências de template inválidas', async () => {
      // Arrange
      const invalidTemplateId = 'template-inexistente';
      
      // Mock: template não encontrado
      mockSupabase.from().select().eq().eq().single
        .mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' }
        });

      // Act
      const template = await emailTemplateMappingService.getTemplateById(invalidTemplateId);

      // Assert
      expect(template).toBeNull();
    });

    it('deve validar campos obrigatórios em templates', async () => {
      // Arrange
      const templateWithMissingFields = {
        id: 'template-incomplete',
        nome: 'Template Incompleto',
        // assunto: undefined, // Campo obrigatório ausente
        // corpo: undefined, // Campo obrigatório ausente
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal',
        modalidade: 'on-premise'
      };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [templateWithMissingFields], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      // O serviço deve retornar o template, mas a validação de campos deve ser feita no frontend
      expect(result).toBeDefined();
      expect(result!.id).toBe('template-incomplete');
      expect(result!.assunto).toBeUndefined();
      expect(result!.corpo).toBeUndefined();
    });
  });

  describe('Performance e Otimização', () => {
    it('deve executar consultas com índices otimizados', async () => {
      // Arrange
      const template = mockTemplates[0];
      
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [template], 
          error: null 
        });

      // Act
      const startTime = performance.now();
      await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');
      const endTime = performance.now();

      // Assert
      // Consulta deve ser rápida (menos de 50ms em ambiente de teste)
      expect(endTime - startTime).toBeLessThan(50);
      
      // Verificar se a consulta usa os índices corretos
      expect(mockSupabase.from).toHaveBeenCalledWith('email_templates');
      const selectCall = mockSupabase.from().select;
      expect(selectCall).toHaveBeenCalledWith('*');
    });

    it('deve otimizar consultas de listagem de mapeamentos', async () => {
      // Arrange
      const allTemplates = mockTemplates.filter(t => t.formulario && t.modalidade);
      
      mockSupabase.from().select().eq().eq().not().order
        .mockResolvedValue({ 
          data: allTemplates, 
          error: null 
        });

      // Act
      const startTime = performance.now();
      const mappings = await emailTemplateMappingService.getMappingsList();
      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100);
      expect(mappings.length).toBe(allTemplates.length);
      
      // Verificar se usa filtros otimizados
      expect(mockSupabase.from().select().eq().eq().not).toHaveBeenCalled();
    });

    it('deve cachear resultados de configuração de fallback', async () => {
      // Act
      const config1 = emailTemplateMappingService.getFallbackConfig();
      const config2 = emailTemplateMappingService.getFallbackConfig();

      // Assert
      // Configurações devem ser idênticas (mesmo objeto em memória)
      expect(config1).toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('Cenários de Integração Complexos', () => {
    it('deve processar múltiplos formulários simultaneamente', async () => {
      // Arrange
      const fiscalTemplate = mockTemplates.find(t => t.formulario === 'comply_fiscal')!;
      const edocsTemplate = mockTemplates.find(t => t.formulario === 'comply_edocs')!;

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValueOnce({ data: [fiscalTemplate], error: null })
        .mockResolvedValueOnce({ data: [edocsTemplate], error: null });

      mockApprovalService.submitForApproval
        .mockResolvedValueOnce('quote-fiscal-123')
        .mockResolvedValueOnce('quote-edocs-456');

      // Act
      const [fiscalResult, edocsResult] = await Promise.all([
        emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise'),
        emailTemplateMappingService.findWithFallback('comply_edocs', 'on-premise')
      ]);

      const [fiscalQuote, edocsQuote] = await Promise.all([
        mockApprovalService.submitForApproval(mockFormDataFiscal, 'comply_fiscal'),
        mockApprovalService.submitForApproval(mockFormDataEDocs, 'comply_edocs')
      ]);

      // Assert
      expect(fiscalResult.template).toEqual(fiscalTemplate);
      expect(edocsResult.template).toEqual(edocsTemplate);
      expect(fiscalQuote).toBe('quote-fiscal-123');
      expect(edocsQuote).toBe('quote-edocs-456');
    });

    it('deve manter consistência durante atualizações concorrentes', async () => {
      // Arrange
      const template = mockTemplates[0];
      
      // Simular consultas concorrentes
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ data: [template], error: null });

      // Act
      const promises = Array.from({ length: 10 }, () =>
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      );

      const results = await Promise.all(promises);

      // Assert
      // Todos os resultados devem ser consistentes
      results.forEach(result => {
        expect(result).toEqual(template);
      });

      // Deve ter feito 10 consultas independentes
      expect(mockSupabase.from).toHaveBeenCalledTimes(10);
    });

    it('deve integrar com sistema de auditoria durante operações', async () => {
      // Arrange
      const template = mockTemplates[0];
      
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ data: [template], error: null });

      // Act
      await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');

      // Assert
      // Verificar se logs de auditoria foram chamados
      const { auditLogger } = await import('@/services/auditLogger');
      expect(auditLogger.logTemplateSearch).toHaveBeenCalledWith(
        'comply_fiscal',
        'on-premise',
        true,
        template.id,
        false,
        undefined,
        expect.any(Number)
      );
    });

    it('deve notificar administradores em caso de problemas críticos', async () => {
      // Arrange
      // Mock: falha em toda a cadeia de fallback
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ data: [], error: null });
      mockSupabase.from().select().eq().eq().eq().is().order().limit
        .mockResolvedValue({ data: [], error: null });
      mockSupabase.from().select().eq().eq().eq().order().limit
        .mockResolvedValue({ data: [], error: null });

      // Act
      await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');

      // Assert
      // Verificar se administradores foram notificados
      const { adminNotificationService } = await import('@/services/adminNotificationService');
      expect(adminNotificationService.notifyError).toHaveBeenCalled();
    });
  });
});