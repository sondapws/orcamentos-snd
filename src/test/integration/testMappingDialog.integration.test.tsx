import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TestMappingDialog from '@/components/admin/email/TestMappingDialog';
import { emailTestService } from '@/services/emailTestService';
import type { EmailTemplateMapping } from '@/services/emailTemplateMappingService';
import type { EmailTemplate } from '@/types/approval';

// Mock completo do Supabase
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({ data: [], error: null }))
        }))
      }))
    })),
    insert: vi.fn(() => ({ error: null }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// Mock do hook de toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

// Mock dos componentes UI para testes de integração
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab: value, onTabChange: onValueChange })
      )}
    </div>
  ),
  TabsList: ({ children, activeTab, onTabChange }: any) => (
    <div data-testid="tabs-list">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, onTabChange })
      )}
    </div>
  ),
  TabsTrigger: ({ children, value, activeTab, onTabChange }: any) => (
    <button 
      data-testid={`tab-trigger-${value}`}
      onClick={() => onTabChange?.(value)}
      className={activeTab === value ? 'active' : ''}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value, activeTab }: any) => 
    activeTab === value ? <div data-testid={`tab-content-${value}`}>{children}</div> : null
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input 
      value={value} 
      onChange={onChange} 
      data-testid={props['data-testid'] || 'input'}
      {...props}
    />
  )
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => (
    <label data-testid="label" {...props}>{children}</label>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

describe('TestMappingDialog - Integration Tests', () => {
  const mockTemplate: EmailTemplate = {
    id: 'template-1',
    nome: 'Template Integração',
    assunto: 'Teste de Integração - {{nome_cliente}}',
    corpo: 'Olá {{nome_cliente}}, este é um teste de integração para {{empresa}}.',
    descricao: 'Template para testes de integração',
    tipo: 'orcamento',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_edocs',
    modalidade: 'saas',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  const mockMapping: EmailTemplateMapping = {
    formulario: 'comply_edocs',
    modalidade: 'saas',
    templateId: 'template-1',
    template: mockTemplate
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    mapping: mockMapping,
    defaultAdminEmail: 'admin@integration-test.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do template no Supabase
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'template-1',
              nome: 'Template Integração',
              assunto: 'Teste de Integração - {{nome_cliente}}',
              corpo: 'Olá {{nome_cliente}}, este é um teste de integração para {{empresa}}.',
              descricao: 'Template para testes de integração',
              tipo: 'orcamento',
              ativo: true,
              vinculado_formulario: true,
              formulario: 'comply_edocs',
              modalidade: 'saas',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-01T00:00:00Z'
            },
            error: null
          }),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: null }))
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve executar fluxo completo de teste de e-mail', async () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    // Verificar se o dialog foi renderizado
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Testar Mapeamento de Template');
    
    // Verificar se as informações do mapeamento estão visíveis
    expect(screen.getByText('Comply e-DOCS')).toBeInTheDocument();
    expect(screen.getByText('SaaS')).toBeInTheDocument();
    expect(screen.getByText('Template Integração')).toBeInTheDocument();
    
    // Aguardar carregamento inicial (prévia e logs)
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('email_test_logs');
    });
    
    // Mudar para aba de envio
    const sendTab = screen.getByTestId('tab-trigger-send');
    fireEvent.click(sendTab);
    
    // Verificar se a aba de envio está ativa
    expect(screen.getByTestId('tab-content-send')).toBeInTheDocument();
    
    // Alterar e-mail do destinatário
    const emailInput = screen.getByDisplayValue('admin@integration-test.com');
    fireEvent.change(emailInput, { target: { value: 'integration@test.com' } });
    
    // Enviar e-mail de teste
    const sendButton = screen.getByText('Enviar E-mail de Teste');
    fireEvent.click(sendButton);
    
    // Verificar se o template foi buscado no banco
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('email_templates');
    });
    
    // Verificar se o log foi registrado
    await waitFor(() => {
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          template_id: 'template-1',
          template_name: 'Template Integração',
          formulario: 'comply_edocs',
          modalidade: 'saas',
          recipient_email: 'integration@test.com',
          success: true,
          tested_by: 'admin'
        })
      );
    });
    
    // Verificar se o toast de sucesso foi exibido
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "E-mail enviado com sucesso",
        description: "E-mail de teste enviado para integration@test.com",
        variant: "default",
      });
    });
  });

  it('deve lidar com erro de template não encontrado', async () => {
    // Mock de erro no Supabase
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Template not found' }
          }),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: null }))
    });
    
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de envio
    const sendTab = screen.getByTestId('tab-trigger-send');
    fireEvent.click(sendTab);
    
    // Tentar enviar e-mail
    const sendButton = screen.getByText('Enviar E-mail de Teste');
    fireEvent.click(sendButton);
    
    // Verificar se o erro foi tratado
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro ao enviar e-mail",
        description: "Template não encontrado ou inativo",
        variant: "destructive",
      });
    });
    
    // Verificar se o log de erro foi registrado
    await waitFor(() => {
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error_message: 'Template não encontrado ou inativo'
        })
      );
    });
  });

  it('deve validar e-mail inválido', async () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de envio
    const sendTab = screen.getByTestId('tab-trigger-send');
    fireEvent.click(sendTab);
    
    // Inserir e-mail inválido
    const emailInput = screen.getByDisplayValue('admin@integration-test.com');
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    
    // Tentar enviar e-mail
    const sendButton = screen.getByText('Enviar E-mail de Teste');
    fireEvent.click(sendButton);
    
    // Verificar se o erro de validação foi exibido
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro ao enviar e-mail",
        description: "E-mail do destinatário inválido",
        variant: "destructive",
      });
    });
  });

  it('deve carregar e exibir logs de teste', async () => {
    const mockLogs = [
      {
        id: 'log-1',
        template_id: 'template-1',
        template_name: 'Template Integração',
        formulario: 'comply_edocs',
        modalidade: 'saas',
        recipient_email: 'test1@example.com',
        success: true,
        tested_by: 'admin',
        tested_at: '2025-01-01T10:00:00Z',
        created_at: '2025-01-01T10:00:00Z'
      },
      {
        id: 'log-2',
        template_id: 'template-1',
        template_name: 'Template Integração',
        formulario: 'comply_edocs',
        modalidade: 'saas',
        recipient_email: 'test2@example.com',
        success: false,
        error_message: 'Erro de teste',
        tested_by: 'admin',
        tested_at: '2025-01-01T09:00:00Z',
        created_at: '2025-01-01T09:00:00Z'
      }
    ];
    
    // Mock dos logs no Supabase
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: mockTemplate,
            error: null
          }),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ 
              eq: vi.fn(() => ({ data: mockLogs, error: null })),
              data: mockLogs, 
              error: null 
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: null }))
    });
    
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de logs
    const logsTab = screen.getByTestId('tab-trigger-logs');
    fireEvent.click(logsTab);
    
    // Verificar se os logs foram carregados
    await waitFor(() => {
      expect(screen.getByText('Teste enviado')).toBeInTheDocument();
      expect(screen.getByText('Falha no teste')).toBeInTheDocument();
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();
      expect(screen.getByText('test2@example.com')).toBeInTheDocument();
      expect(screen.getByText('Erro de teste')).toBeInTheDocument();
    });
  });

  it('deve atualizar prévia quando dados de teste mudam', async () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
    
    // Alterar nome do cliente
    const nomeInput = screen.getByDisplayValue('João Silva');
    fireEvent.change(nomeInput, { target: { value: 'Maria Santos' } });
    
    // Aguardar debounce e regeneração da prévia
    await waitFor(() => {
      expect(nomeInput).toHaveValue('Maria Santos');
    }, { timeout: 1000 });
    
    // Verificar se a prévia foi atualizada (através do iframe)
    const iframe = screen.getByTitle('Prévia do E-mail');
    expect(iframe).toBeInTheDocument();
  });

  it('deve fechar dialog corretamente', () => {
    const onOpenChange = vi.fn();
    render(<TestMappingDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    const closeButton = screen.getByText('Fechar');
    fireEvent.click(closeButton);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('deve lidar com erro de conexão com banco', async () => {
    // Mock de erro de conexão
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockRejectedValue(new Error('Connection failed')),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: { message: 'Connection failed' } }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: { message: 'Connection failed' } }))
    });
    
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de envio
    const sendTab = screen.getByTestId('tab-trigger-send');
    fireEvent.click(sendTab);
    
    // Tentar enviar e-mail
    const sendButton = screen.getByText('Enviar E-mail de Teste');
    fireEvent.click(sendButton);
    
    // Verificar se o erro de conexão foi tratado
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao enviar e-mail",
          variant: "destructive"
        })
      );
    });
  });
});