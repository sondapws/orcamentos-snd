import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailTestService, EmailTestError, emailTestService } from '@/services/emailTestService';
import type { EmailTemplate } from '@/types/approval';

// Get the mocked supabase instance
const { supabase: mockSupabase } = await vi.importMock('@/integrations/supabase/client') as any;

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          limit: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null }))
          })),
          order: vi.fn(() => ({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => ({ error: null }))
    }))
  };
  
  return { supabase: mockSupabase };
});

describe('EmailTestService', () => {
  let service: EmailTestService;

  const mockTemplate: EmailTemplate = {
    id: 'template-1',
    nome: 'Template Teste',
    assunto: 'Bem-vindo {{nome_cliente}}!',
    corpo: 'Olá {{nome_cliente}}, sua empresa {{empresa}} foi cadastrada com sucesso.',
    descricao: 'Template para testes',
    tipo: 'orcamento',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_edocs',
    modalidade: 'saas',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  beforeEach(() => {
    service = new EmailTestService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateEmailPreview', () => {
    it('deve gerar prévia com dados padrão', () => {
      const preview = service.generateEmailPreview(mockTemplate);
      
      expect(preview).toContain('Bem-vindo João Silva!');
      expect(preview).toContain('Olá João Silva, sua empresa Empresa Teste Ltda foi cadastrada');
      expect(preview).toContain('Template Teste');
      expect(preview).toContain('Comply e-DOCS');
      expect(preview).toContain('SaaS');
    });

    it('deve gerar prévia com dados personalizados', () => {
      const testData = {
        nome_cliente: 'Maria Santos',
        empresa: 'Santos & Cia'
      };
      
      const preview = service.generateEmailPreview(mockTemplate, testData);
      
      expect(preview).toContain('Bem-vindo Maria Santos!');
      expect(preview).toContain('Olá Maria Santos, sua empresa Santos & Cia foi cadastrada');
    });

    it('deve incluir aviso de e-mail de teste', () => {
      const preview = service.generateEmailPreview(mockTemplate);
      
      expect(preview).toContain('⚠️ E-mail de Teste');
      expect(preview).toContain('Este é um e-mail de teste gerado automaticamente');
    });

    it('deve incluir informações do template', () => {
      const preview = service.generateEmailPreview(mockTemplate);
      
      expect(preview).toContain('Template: Template Teste');
      expect(preview).toContain('ID: template-1');
      expect(preview).toContain('Formulário: Comply e-DOCS');
      expect(preview).toContain('Modalidade: SaaS');
    });

    it('deve tratar template do Comply Fiscal', () => {
      const fiscalTemplate = {
        ...mockTemplate,
        formulario: 'comply_fiscal' as const,
        modalidade: 'on-premise' as const
      };
      
      const preview = service.generateEmailPreview(fiscalTemplate);
      
      expect(preview).toContain('Formulário: Comply Fiscal');
      expect(preview).toContain('Modalidade: On-premise');
    });

    it('deve lançar erro em caso de falha', () => {
      const invalidTemplate = { ...mockTemplate, assunto: null as any };
      
      expect(() => service.generateEmailPreview(invalidTemplate)).toThrow(EmailTestError);
    });
  });

  describe('sendTestEmail', () => {
    const validRequest = {
      templateId: 'template-1',
      recipientEmail: 'test@example.com',
      formulario: 'comply_edocs' as const,
      modalidade: 'saas' as const,
      testData: { nome_cliente: 'João' }
    };

    beforeEach(() => {
      // Mock successful template fetch
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'template-1',
                nome: 'Template Teste',
                assunto: 'Assunto {{nome_cliente}}',
                corpo: 'Corpo {{nome_cliente}}',
                descricao: 'Descrição',
                tipo: 'orcamento',
                ativo: true,
                vinculado_formulario: true,
                formulario: 'comply_edocs',
                modalidade: 'saas',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z'
              },
              error: null
            })
          }))
        })),
        insert: vi.fn(() => ({ error: null }))
      });
    });

    it('deve enviar e-mail de teste com sucesso', async () => {
      const result = await service.sendTestEmail(validRequest);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('E-mail de teste enviado com sucesso');
      expect(result.emailId).toMatch(/^test_\d+$/);
      expect(result.previewHtml).toContain('Assunto João');
    });

    it('deve validar e-mail do destinatário', async () => {
      const invalidRequest = {
        ...validRequest,
        recipientEmail: 'email-invalido'
      };
      
      await expect(service.sendTestEmail(invalidRequest)).rejects.toThrow(
        new EmailTestError('E-mail do destinatário inválido', 'INVALID_EMAIL')
      );
    });

    it('deve lançar erro se template não for encontrado', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Template not found' }
            })
          }))
        })),
        insert: vi.fn(() => ({ error: null }))
      });
      
      await expect(service.sendTestEmail(validRequest)).rejects.toThrow(
        new EmailTestError('Template não encontrado ou inativo', 'TEMPLATE_NOT_FOUND')
      );
    });

    it('deve registrar log de sucesso', async () => {
      await service.sendTestEmail(validRequest);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('email_test_logs');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          template_id: 'template-1',
          template_name: 'Template Teste',
          formulario: 'comply_edocs',
          modalidade: 'saas',
          recipient_email: 'test@example.com',
          success: true,
          tested_by: 'admin'
        })
      );
    });

    it('deve registrar log de erro em caso de falha', async () => {
      const invalidRequest = {
        ...validRequest,
        recipientEmail: 'email-invalido'
      };
      
      try {
        await service.sendTestEmail(invalidRequest);
      } catch (error) {
        // Esperado
      }
      
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error_message: 'E-mail do destinatário inválido'
        })
      );
    });
  });

  describe('getTestLogs', () => {
    beforeEach(() => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              eq: vi.fn(() => ({ data: [], error: null })),
              data: [],
              error: null
            }))
          }))
        }))
      });
    });

    it('deve buscar logs sem filtro de template', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          template_id: 'template-1',
          template_name: 'Template Teste',
          success: true,
          tested_at: '2025-01-01T12:00:00Z'
        }
      ];
      
      mockSupabase.from().select().order().limit.mockReturnValue({
        data: mockLogs,
        error: null
      });
      
      const logs = await service.getTestLogs();
      
      expect(logs).toEqual(mockLogs);
      expect(mockSupabase.from).toHaveBeenCalledWith('email_test_logs');
    });

    it('deve buscar logs filtrados por template', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          template_id: 'template-1',
          template_name: 'Template Teste',
          success: true,
          tested_at: '2025-01-01T12:00:00Z'
        }
      ];
      
      mockSupabase.from().select().order().limit.mockReturnValue({
        eq: vi.fn(() => ({ data: mockLogs, error: null }))
      });
      
      const logs = await service.getTestLogs('template-1');
      
      expect(logs).toEqual(mockLogs);
    });

    it('deve respeitar limite de resultados', async () => {
      await service.getTestLogs(undefined, 25);
      
      expect(mockSupabase.from().select().order().limit).toHaveBeenCalledWith(25);
    });

    it('deve lançar erro em caso de falha na consulta', async () => {
      mockSupabase.from().select().order().limit.mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      await expect(service.getTestLogs()).rejects.toThrow(
        new EmailTestError('Erro ao buscar logs de teste', 'DATABASE_ERROR')
      );
    });
  });

  describe('isValidEmail (private method)', () => {
    it('deve validar e-mails válidos', async () => {
      const validRequest = {
        templateId: 'template-1',
        recipientEmail: 'valid@example.com',
        formulario: 'comply_edocs' as const,
        modalidade: 'saas' as const
      };
      
      // Se não lançar erro, o e-mail é válido
      await expect(service.sendTestEmail(validRequest)).resolves.toBeDefined();
    });

    it('deve rejeitar e-mails inválidos', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user.example.com',
        ''
      ];
      
      for (const email of invalidEmails) {
        const invalidRequest = {
          templateId: 'template-1',
          recipientEmail: email,
          formulario: 'comply_edocs' as const,
          modalidade: 'saas' as const
        };
        
        await expect(service.sendTestEmail(invalidRequest)).rejects.toThrow(
          new EmailTestError('E-mail do destinatário inválido', 'INVALID_EMAIL')
        );
      }
    });
  });

  describe('singleton instance', () => {
    it('deve exportar instância singleton', () => {
      expect(emailTestService).toBeInstanceOf(EmailTestService);
    });
  });
});