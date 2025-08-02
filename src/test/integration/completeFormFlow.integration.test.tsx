import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FormularioComplyFiscal2 from '@/components/form/FormularioComplyFiscal2';
import FormularioComplyEDocs2 from '@/components/form/FormularioComplyEDocs2';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { approvalService } from '@/services/approvalService';
import type { EmailTemplate } from '@/types/approval';
import type { FormDataFiscal } from '@/types/formDataFiscal';
import type { FormData } from '@/types/formData';

// Mock completo dos serviços
vi.mock('@/services/emailTemplateMappingService');
vi.mock('@/services/approvalService');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock dos componentes UI
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

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onValueChange })
      )}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value, onValueChange }: any) => (
    <button 
      data-testid={`select-item-${value}`}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid={props['data-testid'] || 'checkbox'}
      {...props}
    />
  )
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => (
    <label data-testid="label" {...props}>{children}</label>
  )
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

// Mock das seções do formulário
vi.mock('@/components/form/sections/SeletorSegmento', () => ({
  default: ({ value, onChange, error }: any) => (
    <div data-testid="segmento-selector">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        data-testid="segmento-select"
      >
        <option value="">Selecione</option>
        <option value="industria">Indústria</option>
        <option value="varejo">Varejo</option>
        <option value="servicos">Serviços</option>
      </select>
      {error && <span data-testid="segmento-error">{error}</span>}
    </div>
  )
}));

vi.mock('@/components/form/sections/SeletorEscopo', () => ({
  default: ({ escopoInbound, escopoOutbound, onCheckboxChange, error }: any) => (
    <div data-testid="escopo-selector">
      <div>
        <input
          type="checkbox"
          data-testid="escopo-nfse-inbound"
          checked={escopoInbound?.includes('nfse')}
          onChange={(e) => onCheckboxChange('escopoInbound', 'nfse', e.target.checked)}
        />
        <label>NFSe Inbound</label>
      </div>
      <div>
        <input
          type="checkbox"
          data-testid="escopo-nfe-outbound"
          checked={escopoOutbound?.includes('nfe')}
          onChange={(e) => onCheckboxChange('escopoOutbound', 'nfe', e.target.checked)}
        />
        <label>NFe Outbound</label>
      </div>
      {error && <span data-testid="escopo-error">{error}</span>}
    </div>
  )
}));

vi.mock('@/components/form/sections/SecaoAutomacao', () => ({
  default: ({ modelosNotas, cenariosNegocio, onCheckboxChange }: any) => (
    <div data-testid="automacao-section">
      <input
        type="checkbox"
        data-testid="modelo-55"
        checked={modelosNotas?.includes('55')}
        onChange={(e) => onCheckboxChange('modelosNotas', '55', e.target.checked)}
      />
      <input
        type="checkbox"
        data-testid="cenario-b2b"
        checked={cenariosNegocio?.includes('b2b')}
        onChange={(e) => onCheckboxChange('cenariosNegocio', 'b2b', e.target.checked)}
      />
    </div>
  )
}));

vi.mock('@/components/form/sections/SecaoAbrangencia', () => ({
  default: ({ quantidadeEmpresas, quantidadeUfs, onUpdate }: any) => (
    <div data-testid="abrangencia-section">
      <input
        type="number"
        data-testid="quantidade-empresas"
        value={quantidadeEmpresas}
        onChange={(e) => onUpdate('quantidadeEmpresas', parseInt(e.target.value))}
      />
      <input
        type="number"
        data-testid="quantidade-ufs"
        value={quantidadeUfs}
        onChange={(e) => onUpdate('quantidadeUfs', parseInt(e.target.value))}
      />
    </div>
  )
}));

vi.mock('@/components/form/sections/SecaoConfiguracao', () => ({
  default: ({ volumetriaNotas, modalidade, prazoContratacao, onUpdate, errors }: any) => (
    <div data-testid="configuracao-section">
      <select
        data-testid="volumetria-select"
        value={volumetriaNotas}
        onChange={(e) => onUpdate('volumetriaNotas', e.target.value)}
      >
        <option value="">Selecione</option>
        <option value="1000-5000">1.000 - 5.000</option>
        <option value="5000-10000">5.000 - 10.000</option>
      </select>
      <select
        data-testid="modalidade-select"
        value={modalidade}
        onChange={(e) => onUpdate('modalidade', e.target.value)}
      >
        <option value="">Selecione</option>
        <option value="on-premise">On-premise</option>
        <option value="saas">SaaS</option>
      </select>
      <input
        type="number"
        data-testid="prazo-input"
        value={prazoContratacao}
        onChange={(e) => onUpdate('prazoContratacao', parseInt(e.target.value))}
      />
      {errors.volumetriaNotas && <span data-testid="volumetria-error">{errors.volumetriaNotas}</span>}
      {errors.modalidade && <span data-testid="modalidade-error">{errors.modalidade}</span>}
      {errors.prazoContratacao && <span data-testid="prazo-error">{errors.prazoContratacao}</span>}
    </div>
  )
}));

// Mock do hook de mapeamento
vi.mock('@/hooks/useEmailTemplateMapping', () => ({
  useEmailTemplateMapping: () => ({
    findWithFallback: vi.fn(),
    loading: false
  }),
  FormContextProviderComponent: ({ children }: any) => <div data-testid="form-context">{children}</div>
}));

describe('Complete Form Flow - Integration Tests', () => {
  const mockEmailTemplateMappingService = vi.mocked(emailTemplateMappingService);
  const mockApprovalService = vi.mocked(approvalService);

  // Templates de teste
  const mockTemplates: Record<string, EmailTemplate> = {
    'fiscal-onprem': {
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
    'fiscal-saas': {
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
    'edocs-onprem': {
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
    'edocs-saas': {
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
    'fiscal-default': {
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
  };

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

  const mockStep2DataFiscal = {
    segmento: 'industria' as const,
    escopo: ['nfe', 'nfce'],
    quantidadeEmpresas: 1,
    quantidadeUfs: 1,
    volumetriaNotas: '1000-5000',
    modalidade: 'on-premise' as const,
    prazoContratacao: 12
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

  const mockStep2DataEDocs = {
    segmento: 'varejo' as const,
    escopoInbound: ['nfse'],
    escopoOutbound: ['nfe'],
    modelosNotas: ['55'],
    cenariosNegocio: ['b2b'],
    quantidadeEmpresas: 2,
    quantidadeUfs: 2,
    volumetriaNotas: '5000-10000',
    modalidade: 'saas' as const,
    prazoContratacao: 24
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Fluxo Completo - Formulário Comply Fiscal', () => {
    it('deve executar fluxo completo: preenchimento → validação → template → submissão', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      mockEmailTemplateMappingService.findWithFallback.mockResolvedValue({
        template: mockTemplates['fiscal-onprem'],
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific'
      });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-123');

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      // Verificar se o formulário foi renderizado
      expect(screen.getByText('Questionário Técnico')).toBeInTheDocument();
      expect(screen.getByTestId('form-context')).toBeInTheDocument();

      // Submeter formulário
      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalledWith(
          'comply_fiscal',
          'on-premise'
        );
      });

      await waitFor(() => {
        expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
          mockFormDataFiscal,
          'comply_fiscal'
        );
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('deve validar campos obrigatórios antes da submissão', async () => {
      // Arrange
      const incompleteData = {
        ...mockStep2DataFiscal,
        segmento: '', // Campo obrigatório vazio
        volumetriaNotas: '', // Campo obrigatório vazio
        modalidade: '' as const // Campo obrigatório vazio
      };

      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyFiscal2
          data={incompleteData}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      // Tentar submeter formulário incompleto
      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      // Não deve chamar os serviços se a validação falhar
      expect(mockEmailTemplateMappingService.findWithFallback).not.toHaveBeenCalled();
      expect(mockApprovalService.submitForApproval).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('deve usar template de fallback quando específico não encontrado', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      mockEmailTemplateMappingService.findWithFallback.mockResolvedValue({
        template: mockTemplates['fiscal-default'],
        isDefault: true,
        mappingFound: false,
        fallbackType: 'form_default',
        fallbackReason: 'Template padrão do formulário usado como fallback'
      });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-fallback-123');

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalledWith(
          'comply_fiscal',
          'on-premise'
        );
      });

      await waitFor(() => {
        expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
          mockFormDataFiscal,
          'comply_fiscal'
        );
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('deve tratar erro quando nenhum template é encontrado', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      mockEmailTemplateMappingService.findWithFallback.mockResolvedValue({
        template: null,
        isDefault: false,
        mappingFound: false,
        fallbackType: 'none',
        fallbackReason: 'Nenhum template encontrado'
      });

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalledWith(
          'comply_fiscal',
          'on-premise'
        );
      });

      // Não deve submeter quando não há template
      expect(mockApprovalService.submitForApproval).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Fluxo Completo - Formulário Comply e-DOCS', () => {
    it('deve executar fluxo completo: preenchimento → validação → template → submissão', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      mockEmailTemplateMappingService.findWithFallback.mockResolvedValue({
        template: mockTemplates['edocs-saas'],
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific'
      });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-456');

      // Act
      render(
        <FormularioComplyEDocs2
          data={mockStep2DataEDocs}
          formData={mockFormDataEDocs}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      // Verificar se o formulário foi renderizado
      expect(screen.getByText('Questionário Técnico')).toBeInTheDocument();
      expect(screen.getByTestId('form-context')).toBeInTheDocument();

      // Submeter formulário
      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalledWith(
          'comply_edocs',
          'saas'
        );
      });

      await waitFor(() => {
        expect(mockApprovalService.submitForApproval).toHaveBeenCalledWith(
          mockFormDataEDocs,
          'comply_edocs'
        );
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('deve enviar diretamente para emails @sonda.com', async () => {
      // Arrange
      const sondaFormData = { ...mockFormDataEDocs, email: 'admin@sonda.com' };
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      mockEmailTemplateMappingService.findWithFallback.mockResolvedValue({
        template: mockTemplates['edocs-saas'],
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific'
      });

      mockApprovalService.sendQuoteDirectly.mockResolvedValue(true);

      // Act
      render(
        <FormularioComplyEDocs2
          data={mockStep2DataEDocs}
          formData={sondaFormData}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalledWith(
          'comply_edocs',
          'saas'
        );
      });

      await waitFor(() => {
        expect(mockApprovalService.sendQuoteDirectly).toHaveBeenCalledWith(
          sondaFormData,
          'comply_edocs'
        );
      });

      // Não deve usar o fluxo de aprovação
      expect(mockApprovalService.submitForApproval).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('deve validar escopo obrigatório (inbound ou outbound)', async () => {
      // Arrange
      const incompleteData = {
        ...mockStep2DataEDocs,
        escopoInbound: [], // Sem escopo inbound
        escopoOutbound: [] // Sem escopo outbound
      };

      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyEDocs2
          data={incompleteData}
          formData={mockFormDataEDocs}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      // Não deve chamar os serviços se a validação falhar
      expect(mockEmailTemplateMappingService.findWithFallback).not.toHaveBeenCalled();
      expect(mockApprovalService.submitForApproval).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Cenários de Erro e Recuperação', () => {
    it('deve tratar erro de conexão durante busca de template', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      mockEmailTemplateMappingService.findWithFallback.mockRejectedValue(
        new Error('Connection timeout')
      );

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalled();
      });

      // Não deve prosseguir com erro de template
      expect(mockApprovalService.submitForApproval).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('deve tratar erro durante submissão para aprovação', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      mockEmailTemplateMappingService.findWithFallback.mockResolvedValue({
        template: mockTemplates['fiscal-onprem'],
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific'
      });

      mockApprovalService.submitForApproval.mockRejectedValue(
        new Error('Approval service unavailable')
      );

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApprovalService.submitForApproval).toHaveBeenCalled();
      });

      // Não deve chamar onSubmit em caso de erro
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('deve recuperar de erro temporário de template', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Primeiro erro, depois sucesso
      mockEmailTemplateMappingService.findWithFallback
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          template: mockTemplates['fiscal-onprem'],
          isDefault: false,
          mappingFound: true,
          fallbackType: 'specific'
        });

      mockApprovalService.submitForApproval.mockResolvedValue('quote-retry-123');

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      // Primeira tentativa (falha)
      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalledTimes(1);
      });

      // Segunda tentativa (sucesso)
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockEmailTemplateMappingService.findWithFallback).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(mockApprovalService.submitForApproval).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Interação do Usuário e Estados do Formulário', () => {
    it('deve atualizar dados quando usuário altera campos', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      // Simular mudança de segmento
      const segmentoSelect = screen.getByTestId('segmento-select');
      fireEvent.change(segmentoSelect, { target: { value: 'varejo' } });

      // Assert
      expect(mockOnUpdate).toHaveBeenCalledWith({ segmento: 'varejo' });
    });

    it('deve desabilitar botão durante submissão', async () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Mock com delay para simular processamento
      mockEmailTemplateMappingService.findWithFallback.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          template: mockTemplates['fiscal-onprem'],
          isDefault: false,
          mappingFound: true,
          fallbackType: 'specific'
        }), 1000))
      );

      mockApprovalService.submitForApproval.mockResolvedValue('quote-123');

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      // Botão deve estar desabilitado durante processamento
      expect(submitButton).toBeDisabled();
    });

    it('deve permitir voltar para etapa anterior', () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      const backButton = screen.getByRole('button', { name: /voltar/i });
      fireEvent.click(backButton);

      // Assert
      expect(mockOnPrev).toHaveBeenCalled();
    });
  });

  describe('Contexto de Formulário e Providers', () => {
    it('deve fornecer contexto correto para formulário fiscal', () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2DataFiscal}
          formData={mockFormDataFiscal}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      // Assert
      expect(screen.getByTestId('form-context')).toBeInTheDocument();
      expect(screen.getByText('Questionário Técnico')).toBeInTheDocument();
    });

    it('deve fornecer contexto correto para formulário e-DOCS', () => {
      // Arrange
      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyEDocs2
          data={mockStep2DataEDocs}
          formData={mockFormDataEDocs}
          onUpdate={mockOnUpdate}
          onPrev={mockOnPrev}
          onSubmit={mockOnSubmit}
        />
      );

      // Assert
      expect(screen.getByTestId('form-context')).toBeInTheDocument();
      expect(screen.getByText('Questionário Técnico')).toBeInTheDocument();
    });
  });
});