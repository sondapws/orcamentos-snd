import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TestMappingDialog from '@/components/admin/email/TestMappingDialog';
import { emailTestService } from '@/services/emailTestService';
import type { EmailTemplateMapping } from '@/services/emailTemplateMappingService';
import type { EmailTemplate } from '@/types/approval';

// Mock do serviço de teste de e-mail
vi.mock('@/services/emailTestService', () => ({
  emailTestService: {
    generateEmailPreview: vi.fn(),
    sendTestEmail: vi.fn(),
    getTestLogs: vi.fn()
  }
}));

// Mock do hook de toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock dos componentes UI
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
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange?.('preview')}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  )
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

describe('TestMappingDialog', () => {
  const mockTemplate: EmailTemplate = {
    id: 'template-1',
    nome: 'Template Teste',
    assunto: 'Assunto do Template {{nome_cliente}}',
    corpo: 'Olá {{nome_cliente}}, bem-vindo à {{empresa}}!',
    descricao: 'Template para testes',
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
    defaultAdminEmail: 'admin@test.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock das funções do emailTestService
    (emailTestService.generateEmailPreview as any).mockReturnValue(
      '<html><body>Preview do e-mail</body></html>'
    );
    
    (emailTestService.sendTestEmail as any).mockResolvedValue({
      success: true,
      message: 'E-mail enviado com sucesso',
      emailId: 'test-123'
    });
    
    (emailTestService.getTestLogs as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve renderizar o dialog quando aberto', () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Testar Mapeamento de Template');
  });

  it('não deve renderizar quando fechado', () => {
    render(<TestMappingDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('não deve renderizar quando mapping é null', () => {
    render(<TestMappingDialog {...defaultProps} mapping={null} />);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('deve exibir informações do mapeamento', () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(3);
    
    // Verificar se as informações do mapeamento estão sendo exibidas
    expect(screen.getByText('Comply e-DOCS')).toBeInTheDocument();
    expect(screen.getByText('SaaS')).toBeInTheDocument();
    expect(screen.getByText('Template Teste')).toBeInTheDocument();
  });

  it('deve gerar prévia do e-mail ao abrir', async () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(emailTestService.generateEmailPreview).toHaveBeenCalledWith(
        mockTemplate,
        expect.objectContaining({
          nome_cliente: 'João Silva',
          empresa: 'Empresa Teste Ltda'
        })
      );
    });
  });

  it('deve carregar logs de teste ao abrir', async () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(emailTestService.getTestLogs).toHaveBeenCalledWith('template-1', 10);
    });
  });

  it('deve permitir alterar dados de teste', async () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    const nomeInput = screen.getByDisplayValue('João Silva');
    fireEvent.change(nomeInput, { target: { value: 'Maria Silva' } });
    
    expect(nomeInput).toHaveValue('Maria Silva');
    
    // Deve regenerar a prévia após mudança
    await waitFor(() => {
      expect(emailTestService.generateEmailPreview).toHaveBeenCalledWith(
        mockTemplate,
        expect.objectContaining({
          nome_cliente: 'Maria Silva'
        })
      );
    }, { timeout: 1000 });
  });

  it('deve permitir enviar e-mail de teste', async () => {
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de envio
    const sendTab = screen.getByTestId('tab-trigger-send');
    fireEvent.click(sendTab);
    
    // Alterar e-mail do destinatário
    const emailInput = screen.getByDisplayValue('admin@test.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Clicar no botão de enviar
    const sendButton = screen.getByText('Enviar E-mail de Teste');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(emailTestService.sendTestEmail).toHaveBeenCalledWith({
        templateId: 'template-1',
        recipientEmail: 'test@example.com',
        formulario: 'comply_edocs',
        modalidade: 'saas',
        testData: expect.objectContaining({
          nome_cliente: 'João Silva',
          empresa: 'Empresa Teste Ltda'
        })
      });
    });
  });

  it('deve desabilitar botão de teste para templates inativos', () => {
    const inactiveMapping = {
      ...mockMapping,
      template: {
        ...mockTemplate,
        ativo: false
      }
    };
    
    render(<TestMappingDialog {...defaultProps} mapping={inactiveMapping} />);
    
    // O dialog não deve renderizar para templates inativos
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('deve exibir logs de teste quando disponíveis', async () => {
    const mockLogs = [
      {
        id: 'log-1',
        template_id: 'template-1',
        template_name: 'Template Teste',
        formulario: 'comply_edocs' as const,
        modalidade: 'saas' as const,
        recipient_email: 'test@example.com',
        success: true,
        tested_by: 'admin',
        tested_at: '2025-01-01T12:00:00Z',
        created_at: '2025-01-01T12:00:00Z'
      }
    ];
    
    (emailTestService.getTestLogs as any).mockResolvedValue(mockLogs);
    
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de logs
    const logsTab = screen.getByTestId('tab-trigger-logs');
    fireEvent.click(logsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Teste enviado')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem quando não há logs', async () => {
    (emailTestService.getTestLogs as any).mockResolvedValue([]);
    
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de logs
    const logsTab = screen.getByTestId('tab-trigger-logs');
    fireEvent.click(logsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum teste realizado ainda')).toBeInTheDocument();
    });
  });

  it('deve fechar o dialog ao clicar em fechar', () => {
    const onOpenChange = vi.fn();
    render(<TestMappingDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    const closeButton = screen.getByText('Fechar');
    fireEvent.click(closeButton);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('deve lidar com erros ao gerar prévia', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (emailTestService.generateEmailPreview as any).mockImplementation(() => {
      throw new Error('Erro ao gerar prévia');
    });
    
    render(<TestMappingDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Erro ao gerar prévia:',
        expect.any(Error)
      );
    });
    
    consoleError.mockRestore();
  });

  it('deve lidar com erros ao enviar e-mail', async () => {
    (emailTestService.sendTestEmail as any).mockRejectedValue(
      new Error('Erro ao enviar e-mail')
    );
    
    render(<TestMappingDialog {...defaultProps} />);
    
    // Mudar para aba de envio
    const sendTab = screen.getByTestId('tab-trigger-send');
    fireEvent.click(sendTab);
    
    // Clicar no botão de enviar
    const sendButton = screen.getByText('Enviar E-mail de Teste');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(emailTestService.sendTestEmail).toHaveBeenCalled();
    });
  });
});