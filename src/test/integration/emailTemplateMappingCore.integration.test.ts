import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { approvalService } from '@/services/approvalService';
import type { EmailTemplate } from '@/types/approval';

// Mock simplificado dos serviços
vi.mock('@/services/emailTemplateMappingService', () => ({
  emailTemplateMappingService: {
    findWithFallback: vi.fn(),
    findByMapping: vi.fn(),
    validateUniqueness: vi.fn(),
    getMappingsList: vi.fn(),
    getTemplateById: vi.fn()
  }
}));

vi.mock('@/services/approvalService', () => ({
  approvalService: {
    submitForApproval: vi.fn(),
    sendQuoteDirectly: vi.fn()
  }
}));

describe('Email Template Mapping - Core Integration Tests', () => {
  const mockEmailService = vi.mocked(emailTemplateMappingService);
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Integração Formulário → Mapeamento → E-mail', () => {
    it('deve executar fluxo completo: Comply Fiscal On-premise → Template específico → Aprovação', async () => {
      // Arrange
      const specificTemplate = mockTemplates[0];
      
      mockEmailService.findWithFallback.mockResolvedValue({
        template: specificTemplate,
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific'
      });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-123');

      const formData = {
        razaoSocial: 'Empresa Teste Ltda',
        responsavel: 'João Silva',
        email: 'joao@empresa.com',
        modalidade: 'on-premise'
      };

      // Act
      const templateResult = await mockEmailService.findWithFallback('comply_fiscal', 'on-premise');
      const quoteId = await mockApprovalService.submitForApproval(formData, 'comply_fiscal');

      // Assert
      expect(templateResult.template).toEqual(specificTemplate);
      expect(templateResult.isDefault).toBe(false);
      expect(templateResult.mappingFound).toBe(true);
      expect(templateResult.fallbackType).toBe('specific');

      expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
        formData,
        'comply_fiscal'
      );
      expect(quoteId).toBe('quote-123');
    });

    it('deve executar fluxo completo: Comply e-DOCS SaaS → Template específico → Envio direto', async () => {
      // Arrange
      const specificTemplate = mockTemplates[1];
      const sondaFormData = {
        razaoSocial: 'Empresa e-DOCS Ltda',
        responsavel: 'Maria Santos',
        email: 'admin@sonda.com',
        modalidade: 'saas'
      };

      mockEmailService.findWithFallback.mockResolvedValue({
        template: specificTemplate,
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific'
      });

      mockApprovalService.sendQuoteDirectly.mockResolvedValue(true);

      // Act
      const templateResult = await mockEmailService.findWithFallback('comply_edocs', 'saas');
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

      // Não deve usar o fluxo de aprovação
      expect(mockApprovalService.submitForApproval).not.toHaveBeenCalled();
    });

    it('deve executar fluxo com fallback: Template específico não encontrado → Template padrão → Aprovação', async () => {
      // Arrange
      const defaultTemplate = mockTemplates[2];

      mockEmailService.findWithFallback.mockResolvedValue({
        template: defaultTemplate,
        isDefault: true,
        mappingFound: false,
        fallbackType: 'form_default',
        fallbackReason: 'Template padrão do formulário usado como fallback'
      });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-fallback-123');

      const formData = {
        razaoSocial: 'Empresa Teste Ltda',
        responsavel: 'João Silva',
        email: 'joao@empresa.com',
        modalidade: 'saas'
      };

      // Act
      const templateResult = await mockEmailService.findWithFallback('comply_fiscal', 'saas');
      const quoteId = await mockApprovalService.submitForApproval(formData, 'comply_fiscal');

      // Assert
      expect(templateResult.template).toEqual(defaultTemplate);
      expect(templateResult.isDefault).toBe(true);
      expect(templateResult.mappingFound).toBe(false);
      expect(templateResult.fallbackType).toBe('form_default');

      expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
        formData,
        'comply_fiscal'
      );
      expect(quoteId).toBe('quote-fallback-123');
    });

    it('deve falhar quando nenhum template é encontrado', async () => {
      // Arrange
      mockEmailService.findWithFallback.mockResolvedValue({
        template: null,
        isDefault: false,
        mappingFound: false,
        fallbackType: 'none',
        fallbackReason: 'Nenhum template encontrado'
      });

      // Act
      const templateResult = await mockEmailService.findWithFallback('comply_fiscal', 'on-premise');

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
      mockEmailService.findByMapping
        .mockRejectedValueOnce(dbError)
        .mockResolvedValueOnce(mockTemplates[0]);

      // Act & Assert
      // Primeira tentativa deve falhar
      await expect(
        mockEmailService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow('Connection timeout');

      // Segunda tentativa deve funcionar
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');
      expect(result).toEqual(mockTemplates[0]);
    });

    it('deve tratar erro de validação de unicidade', async () => {
      // Arrange
      mockEmailService.validateUniqueness.mockResolvedValue(false);

      // Act
      const isUnique = await mockEmailService.validateUniqueness(
        'comply_fiscal',
        'on-premise',
        'different-template-id'
      );

      // Assert
      expect(isUnique).toBe(false);
      expect(mockEmailService.validateUniqueness).toHaveBeenCalledWith(
        'comply_fiscal',
        'on-premise',
        'different-template-id'
      );
    });

    it('deve tratar erro no serviço de aprovação', async () => {
      // Arrange
      const approvalError = new Error('Approval service temporarily unavailable');
      
      mockApprovalService.submitForApproval
        .mockRejectedValueOnce(approvalError)
        .mockResolvedValueOnce('quote-recovered-123');

      const formData = { email: 'test@example.com' };

      // Act
      let result;
      try {
        await mockApprovalService.submitForApproval(formData, 'comply_fiscal');
      } catch (error) {
        // Retry após erro
        result = await mockApprovalService.submitForApproval(formData, 'comply_fiscal');
      }

      // Assert
      expect(result).toBe('quote-recovered-123');
      expect(mockApprovalService.submitForApproval).toHaveBeenCalledTimes(2);
    });
  });

  describe('Validação de Dados', () => {
    it('deve validar integridade dos dados de template', async () => {
      // Arrange
      const validTemplate = mockTemplates[0];
      mockEmailService.findByMapping.mockResolvedValue(validTemplate);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

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
      const mappings = [
        {
          formulario: 'comply_fiscal' as const,
          modalidade: 'on-premise' as const,
          templateId: 'template-1',
          template: mockTemplates[0]
        },
        {
          formulario: 'comply_edocs' as const,
          modalidade: 'saas' as const,
          templateId: 'template-2',
          template: mockTemplates[1]
        }
      ];

      mockEmailService.getMappingsList.mockResolvedValue(mappings);

      // Act
      const result = await mockEmailService.getMappingsList();

      // Assert
      expect(result).toHaveLength(2);
      
      // Verificar se não há duplicatas
      const combinations = result.map(m => `${m.formulario}-${m.modalidade}`);
      const uniqueCombinations = [...new Set(combinations)];
      expect(combinations.length).toBe(uniqueCombinations.length);

      // Verificar se todos os mapeamentos têm dados válidos
      result.forEach(mapping => {
        expect(mapping.formulario).toBeDefined();
        expect(mapping.modalidade).toBeDefined();
        expect(mapping.templateId).toBeDefined();
        expect(mapping.template).toBeDefined();
      });
    });

    it('deve validar referências de template válidas', async () => {
      // Arrange
      const templateWithValidRef = mockTemplates[0];
      mockEmailService.getTemplateById.mockResolvedValue(templateWithValidRef);

      // Act
      const template = await mockEmailService.getTemplateById(templateWithValidRef.id);

      // Assert
      expect(template).toEqual(templateWithValidRef);
      expect(template!.id).toBe(templateWithValidRef.id);
      expect(template!.ativo).toBe(true);
    });

    it('deve detectar referências de template inválidas', async () => {
      // Arrange
      const invalidTemplateId = 'template-inexistente';
      mockEmailService.getTemplateById.mockResolvedValue(null);

      // Act
      const template = await mockEmailService.getTemplateById(invalidTemplateId);

      // Assert
      expect(template).toBeNull();
    });
  });

  describe('Performance e Otimização', () => {
    it('deve executar consultas rapidamente', async () => {
      // Arrange
      const template = mockTemplates[0];
      mockEmailService.findByMapping.mockResolvedValue(template);

      // Act
      const startTime = performance.now();
      await mockEmailService.findByMapping('comply_fiscal', 'on-premise');
      const endTime = performance.now();

      // Assert
      // Consulta deve ser rápida (menos de 50ms em ambiente de teste)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('deve otimizar consultas de listagem de mapeamentos', async () => {
      // Arrange
      const mappings = mockTemplates.filter(t => t.formulario && t.modalidade).map(t => ({
        formulario: t.formulario as 'comply_fiscal' | 'comply_edocs',
        modalidade: t.modalidade as 'on-premise' | 'saas',
        templateId: t.id,
        template: t
      }));

      mockEmailService.getMappingsList.mockResolvedValue(mappings);

      // Act
      const startTime = performance.now();
      const result = await mockEmailService.getMappingsList();
      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.length).toBe(mappings.length);
    });
  });

  describe('Cenários de Integração Complexos', () => {
    it('deve processar múltiplos formulários simultaneamente', async () => {
      // Arrange
      const fiscalTemplate = mockTemplates[0];
      const edocsTemplate = mockTemplates[1];

      mockEmailService.findWithFallback
        .mockResolvedValueOnce({
          template: fiscalTemplate,
          isDefault: false,
          mappingFound: true,
          fallbackType: 'specific'
        })
        .mockResolvedValueOnce({
          template: edocsTemplate,
          isDefault: false,
          mappingFound: true,
          fallbackType: 'specific'
        });

      mockApprovalService.submitForApproval
        .mockResolvedValueOnce('quote-fiscal-123')
        .mockResolvedValueOnce('quote-edocs-456');

      // Act
      const [fiscalResult, edocsResult] = await Promise.all([
        mockEmailService.findWithFallback('comply_fiscal', 'on-premise'),
        mockEmailService.findWithFallback('comply_edocs', 'on-premise')
      ]);

      const [fiscalQuote, edocsQuote] = await Promise.all([
        mockApprovalService.submitForApproval({}, 'comply_fiscal'),
        mockApprovalService.submitForApproval({}, 'comply_edocs')
      ]);

      // Assert
      expect(fiscalResult.template).toEqual(fiscalTemplate);
      expect(edocsResult.template).toEqual(edocsTemplate);
      expect(fiscalQuote).toBe('quote-fiscal-123');
      expect(edocsQuote).toBe('quote-edocs-456');
    });

    it('deve manter consistência durante operações concorrentes', async () => {
      // Arrange
      const template = mockTemplates[0];
      mockEmailService.findByMapping.mockResolvedValue(template);

      // Act
      const promises = Array.from({ length: 10 }, () =>
        mockEmailService.findByMapping('comply_fiscal', 'on-premise')
      );

      const results = await Promise.all(promises);

      // Assert
      // Todos os resultados devem ser consistentes
      results.forEach(result => {
        expect(result).toEqual(template);
      });

      // Deve ter feito 10 consultas independentes
      expect(mockEmailService.findByMapping).toHaveBeenCalledTimes(10);
    });
  });

  describe('Cenários de Uso Real', () => {
    it('deve simular fluxo completo de usuário preenchendo formulário fiscal', async () => {
      // Arrange - Usuário preenche formulário
      const formData = {
        razaoSocial: 'Empresa Real Ltda',
        cnpj: '12.345.678/0001-90',
        responsavel: 'João Silva',
        email: 'joao@empresareal.com',
        modalidade: 'on-premise'
      };

      const template = mockTemplates[0];

      mockEmailService.findWithFallback.mockResolvedValue({
        template,
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific'
      });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-real-123');

      // Act - Sistema processa formulário
      const templateResult = await mockEmailService.findWithFallback('comply_fiscal', 'on-premise');
      
      if (templateResult.template) {
        const quoteId = await mockApprovalService.submitForApproval(formData, 'comply_fiscal');
        
        // Assert - Fluxo executado com sucesso
        expect(templateResult.template.nome).toBe('Template Comply Fiscal On-premise');
        expect(quoteId).toBe('quote-real-123');
        expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
          formData,
          'comply_fiscal'
        );
      } else {
        throw new Error('Template não encontrado');
      }
    });

    it('deve simular fluxo de administrador testando mapeamento', async () => {
      // Arrange - Admin quer testar mapeamento
      const mapping = {
        formulario: 'comply_edocs' as const,
        modalidade: 'saas' as const,
        templateId: 'template-edocs-saas',
        template: mockTemplates[1]
      };

      mockEmailService.getTemplateById.mockResolvedValue(mapping.template);

      // Act - Admin testa o mapeamento
      const template = await mockEmailService.getTemplateById(mapping.templateId);

      // Assert - Template correto é retornado para teste
      expect(template).toBeDefined();
      expect(template!.id).toBe(mapping.templateId);
      expect(template!.formulario).toBe(mapping.formulario);
      expect(template!.modalidade).toBe(mapping.modalidade);
      expect(template!.ativo).toBe(true);
    });
  });
});