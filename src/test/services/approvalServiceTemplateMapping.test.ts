import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approvalService } from '@/services/approvalService';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';

// Mock do serviço de mapeamento
vi.mock('@/services/emailTemplateMappingService');
vi.mock('@/services/emailService', () => ({
  emailService: {
    sendEmail: vi.fn().mockResolvedValue({ success: true })
  }
}));

describe('ApprovalService Template Mapping Integration', () => {
  const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendQuoteEmail Integration', () => {
    it('deve usar template específico quando encontrado', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-1',
        nome: 'Template Comply Fiscal On-premise',
        assunto: 'Orçamento {{razaoSocial}}',
        corpo: 'Olá {{responsavel}}, seu orçamento para {{razaoSocial}} está pronto.',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal' as const,
        modalidade: 'on-premise'
      };

      mockFindWithFallback.mockResolvedValue({
        template: mockTemplate,
        isDefault: false,
        mappingFound: true
      });

      const formData = {
        razaoSocial: 'Empresa Teste Ltda',
        responsavel: 'João Silva',
        email: 'joao@empresa.com',
        modalidade: 'on-premise'
      };

      // Act
      const approvalServicePrivate = approvalService as any;
      await approvalServicePrivate.sendQuoteEmail(formData, 'comply_fiscal');

      // Assert
      expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
    });

    it('deve usar template padrão quando mapeamento específico não é encontrado', async () => {
      // Arrange
      const mockDefaultTemplate = {
        id: 'template-default',
        nome: 'Template Padrão Fiscal',
        assunto: 'Orçamento {{razaoSocial}}',
        corpo: 'Template padrão para {{responsavel}}',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal' as const,
        modalidade: null
      };

      mockFindWithFallback.mockResolvedValue({
        template: mockDefaultTemplate,
        isDefault: true,
        mappingFound: false
      });

      const formData = {
        razaoSocial: 'Empresa Teste Ltda',
        responsavel: 'João Silva',
        email: 'joao@empresa.com',
        modalidade: 'saas'
      };

      // Act
      const approvalServicePrivate = approvalService as any;
      await approvalServicePrivate.sendQuoteEmail(formData, 'comply_fiscal');

      // Assert
      expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'saas');
    });

    it('deve usar template padrão do sistema quando nenhum template é encontrado', async () => {
      // Arrange
      mockFindWithFallback.mockResolvedValue({
        template: null,
        isDefault: false,
        mappingFound: false
      });

      const formData = {
        razaoSocial: 'Empresa Teste Ltda',
        responsavel: 'João Silva',
        email: 'joao@empresa.com',
        modalidade: 'on-premise'
      };

      // Act
      const approvalServicePrivate = approvalService as any;
      await approvalServicePrivate.sendQuoteEmail(formData, 'comply_fiscal');

      // Assert
      expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
    });

    it('deve funcionar para formulário comply_edocs', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-edocs-1',
        nome: 'Template Comply e-DOCS SaaS',
        assunto: 'Orçamento e-DOCS {{razaoSocial}}',
        corpo: 'Olá {{responsavel}}, seu orçamento e-DOCS está pronto.',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_edocs' as const,
        modalidade: 'saas'
      };

      mockFindWithFallback.mockResolvedValue({
        template: mockTemplate,
        isDefault: false,
        mappingFound: true
      });

      const formData = {
        razaoSocial: 'Empresa e-DOCS Ltda',
        responsavel: 'Maria Santos',
        email: 'maria@empresa.com',
        modalidade: 'saas'
      };

      // Act
      const approvalServicePrivate = approvalService as any;
      await approvalServicePrivate.sendQuoteEmail(formData, 'comply_edocs');

      // Assert
      expect(mockFindWithFallback).toHaveBeenCalledWith('comply_edocs', 'saas');
    });

    it('deve tratar erro quando serviço de mapeamento falha', async () => {
      // Arrange
      mockFindWithFallback.mockRejectedValue(new Error('Erro de conexão'));

      const formData = {
        razaoSocial: 'Empresa Teste Ltda',
        responsavel: 'João Silva',
        email: 'joao@empresa.com',
        modalidade: 'on-premise'
      };

      // Act & Assert
      const approvalServicePrivate = approvalService as any;
      await expect(
        approvalServicePrivate.sendQuoteEmail(formData, 'comply_fiscal')
      ).rejects.toThrow('Erro de conexão');

      expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
    });
  });

  describe('Template Variable Replacement', () => {
    it('deve substituir variáveis do template corretamente', () => {
      // Arrange
      const template = 'Olá {{responsavel}}, orçamento para {{razaoSocial}} ({{cnpj}}) está pronto. Modalidade: {{modalidade}}';
      const formData = {
        responsavel: 'João Silva',
        razaoSocial: 'Empresa Teste Ltda',
        cnpj: '12.345.678/0001-90',
        modalidade: 'on-premise'
      };

      // Act
      const approvalServicePrivate = approvalService as any;
      const result = approvalServicePrivate.replaceTemplateVariables(template, formData);

      // Assert
      expect(result).toBe('Olá João Silva, orçamento para Empresa Teste Ltda (12.345.678/0001-90) está pronto. Modalidade: on-premise');
    });

    it('deve substituir variáveis não encontradas por N/A', () => {
      // Arrange
      const template = 'Responsável: {{responsavel}}, Campo inexistente: {{campoInexistente}}';
      const formData = {
        responsavel: 'João Silva'
      };

      // Act
      const approvalServicePrivate = approvalService as any;
      const result = approvalServicePrivate.replaceTemplateVariables(template, formData);

      // Assert
      expect(result).toBe('Responsável: João Silva, Campo inexistente: N/A');
    });

    it('deve tratar arrays no escopo corretamente', () => {
      // Arrange
      const template = 'Escopo: {{escopo}}';
      const formData = {
        escopo: ['nfe', 'nfce', 'cte']
      };

      // Act
      const approvalServicePrivate = approvalService as any;
      const result = approvalServicePrivate.replaceTemplateVariables(template, formData);

      // Assert
      expect(result).toBe('Escopo: nfe, nfce, cte');
    });
  });

  describe('Integration Scenarios', () => {
    it('deve integrar corretamente com submitForApproval', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-1',
        nome: 'Template Teste',
        assunto: 'Orçamento {{razaoSocial}}',
        corpo: 'Corpo do template',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal' as const,
        modalidade: 'on-premise'
      };

      mockFindWithFallback.mockResolvedValue({
        template: mockTemplate,
        isDefault: false,
        mappingFound: true
      });

      const formData = {
        razaoSocial: 'Empresa Teste Ltda',
        responsavel: 'João Silva',
        email: 'joao@empresa.com',
        modalidade: 'on-premise'
      };

      // Mock do Supabase para submitForApproval
      const mockSupabaseInsert = vi.fn().mockResolvedValue({
        data: {
          id: 'quote-123',
          form_data: formData,
          product_type: 'comply_fiscal',
          status: 'pending'
        },
        error: null
      });

      const mockSupabaseSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'quote-123',
            form_data: formData,
            product_type: 'comply_fiscal',
            status: 'pending'
          },
          error: null
        })
      });

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn().mockReturnValue({
            insert: mockSupabaseInsert.mockReturnValue({
              select: mockSupabaseSelect
            })
          })
        }
      }));

      // Act
      const result = await approvalService.submitForApproval(formData, 'comply_fiscal');

      // Assert
      expect(result).toBe('quote-123');
    });

    it('deve integrar corretamente com sendQuoteDirectly', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-1',
        nome: 'Template Teste',
        assunto: 'Orçamento {{razaoSocial}}',
        corpo: 'Corpo do template',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_edocs' as const,
        modalidade: 'saas'
      };

      mockFindWithFallback.mockResolvedValue({
        template: mockTemplate,
        isDefault: false,
        mappingFound: true
      });

      const formData = {
        razaoSocial: 'Empresa e-DOCS Ltda',
        responsavel: 'Maria Santos',
        email: 'maria@empresa.com',
        modalidade: 'saas'
      };

      // Act
      const result = await approvalService.sendQuoteDirectly(formData, 'comply_edocs');

      // Assert
      expect(result).toBe(true);
      expect(mockFindWithFallback).toHaveBeenCalledWith('comply_edocs', 'saas');
    });
  });
});