import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { approvalService } from '@/services/approvalService';
import FormularioComplyFiscal2 from '@/components/form/FormularioComplyFiscal2';
import FormularioComplyEDocs2 from '@/components/form/FormularioComplyEDocs2';
import { FormDataFiscal } from '@/types/formDataFiscal';
import { FormData } from '@/types/formData';

// Mock dos serviços
vi.mock('@/services/emailTemplateMappingService');
vi.mock('@/services/approvalService');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('Form Template Mapping Integration', () => {
  const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);
  const mockSubmitForApproval = vi.mocked(approvalService.submitForApproval);
  const mockSendQuoteDirectly = vi.mocked(approvalService.sendQuoteDirectly);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FormularioComplyFiscal2 Integration', () => {
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

    const mockStep2Data = {
      segmento: 'industria' as const,
      escopo: ['nfe', 'nfce'],
      quantidadeEmpresas: 1,
      quantidadeUfs: 1,
      volumetriaNotas: '1000-5000',
      modalidade: 'on-premise' as const,
      prazoContratacao: 12
    };

    it('deve verificar template antes de submeter formulário fiscal', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-fiscal-1',
        nome: 'Template Comply Fiscal On-premise',
        assunto: 'Orçamento Comply Fiscal',
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

      mockSubmitForApproval.mockResolvedValue('quote-123');

      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2Data}
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
        expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
      });

      await waitFor(() => {
        expect(mockSubmitForApproval).toHaveBeenCalledWith(mockFormDataFiscal, 'comply_fiscal');
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('deve usar template padrão quando não encontra mapeamento específico', async () => {
      // Arrange
      const mockDefaultTemplate = {
        id: 'template-default-fiscal',
        nome: 'Template Padrão Fiscal',
        assunto: 'Orçamento Comply Fiscal',
        corpo: 'Template padrão',
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

      mockSubmitForApproval.mockResolvedValue('quote-123');

      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2Data}
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
        expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
      });

      await waitFor(() => {
        expect(mockSubmitForApproval).toHaveBeenCalled();
      });
    });

    it('deve tratar erro quando nenhum template é encontrado', async () => {
      // Arrange
      mockFindWithFallback.mockResolvedValue({
        template: null,
        isDefault: false,
        mappingFound: false
      });

      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2Data}
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
        expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
      });

      // Não deve submeter quando não há template
      expect(mockSubmitForApproval).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('FormularioComplyEDocs2 Integration', () => {
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

    it('deve verificar template antes de submeter formulário e-DOCS', async () => {
      // Arrange
      const mockTemplate = {
        id: 'template-edocs-1',
        nome: 'Template Comply e-DOCS SaaS',
        assunto: 'Orçamento Comply e-DOCS',
        corpo: 'Corpo do template e-DOCS',
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

      mockSubmitForApproval.mockResolvedValue('quote-456');

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

      const submitButton = screen.getByRole('button', { name: /gerar orçamento/i });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockFindWithFallback).toHaveBeenCalledWith('comply_edocs', 'saas');
      });

      await waitFor(() => {
        expect(mockSubmitForApproval).toHaveBeenCalledWith(mockFormDataEDocs, 'comply_edocs');
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('deve enviar diretamente para emails @sonda.com', async () => {
      // Arrange
      const sondaFormData = { ...mockFormDataEDocs, email: 'admin@sonda.com' };
      
      const mockTemplate = {
        id: 'template-edocs-1',
        nome: 'Template Comply e-DOCS SaaS',
        assunto: 'Orçamento Comply e-DOCS',
        corpo: 'Corpo do template e-DOCS',
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

      mockSendQuoteDirectly.mockResolvedValue(true);

      const mockOnUpdate = vi.fn();
      const mockOnPrev = vi.fn();
      const mockOnSubmit = vi.fn();

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
        expect(mockFindWithFallback).toHaveBeenCalledWith('comply_edocs', 'saas');
      });

      await waitFor(() => {
        expect(mockSendQuoteDirectly).toHaveBeenCalledWith(sondaFormData, 'comply_edocs');
      });

      // Não deve usar o fluxo de aprovação
      expect(mockSubmitForApproval).not.toHaveBeenCalled();
    });
  });

  describe('Context Provider Integration', () => {
    it('deve fornecer contexto correto para formulário fiscal', async () => {
      // Arrange
      const mockFormDataFiscal: FormDataFiscal = {
        crm: '',
        razaoSocial: 'Teste',
        cnpj: '12.345.678/0001-90',
        municipio: 'São Paulo',
        uf: 'SP',
        responsavel: 'João',
        email: 'joao@teste.com',
        segmento: 'industria',
        escopo: ['nfe'],
        quantidadeEmpresas: 1,
        quantidadeUfs: 1,
        volumetriaNotas: '1000-5000',
        modalidade: 'on-premise',
        prazoContratacao: 12,
        step: 2,
        completed: false
      };

      const mockStep2Data = {
        segmento: 'industria' as const,
        escopo: ['nfe'],
        quantidadeEmpresas: 1,
        quantidadeUfs: 1,
        volumetriaNotas: '1000-5000',
        modalidade: 'on-premise' as const,
        prazoContratacao: 12
      };

      mockFindWithFallback.mockResolvedValue({
        template: null,
        isDefault: false,
        mappingFound: false
      });

      // Act
      render(
        <FormularioComplyFiscal2
          data={mockStep2Data}
          formData={mockFormDataFiscal}
          onUpdate={vi.fn()}
          onPrev={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      // Assert - O componente deve renderizar sem erros
      expect(screen.getByText('Questionário Técnico')).toBeInTheDocument();
    });

    it('deve fornecer contexto correto para formulário e-DOCS', async () => {
      // Arrange
      const mockFormDataEDocs: FormData = {
        crm: '',
        razaoSocial: 'Teste e-DOCS',
        cnpj: '98.765.432/0001-10',
        municipio: 'Rio de Janeiro',
        uf: 'RJ',
        responsavel: 'Maria',
        email: 'maria@teste.com',
        segmento: 'varejo',
        escopoInbound: ['nfse'],
        escopoOutbound: ['nfe'],
        modelosNotas: ['55'],
        cenariosNegocio: ['b2b'],
        quantidadeEmpresas: 1,
        quantidadeUfs: 1,
        volumetriaNotas: '1000-5000',
        modalidade: 'saas',
        prazoContratacao: 12,
        step: 2,
        completed: false
      };

      const mockStep2DataEDocs = {
        segmento: 'varejo' as const,
        escopoInbound: ['nfse'],
        escopoOutbound: ['nfe'],
        modelosNotas: ['55'],
        cenariosNegocio: ['b2b'],
        quantidadeEmpresas: 1,
        quantidadeUfs: 1,
        volumetriaNotas: '1000-5000',
        modalidade: 'saas' as const,
        prazoContratacao: 12
      };

      mockFindWithFallback.mockResolvedValue({
        template: null,
        isDefault: false,
        mappingFound: false
      });

      // Act
      render(
        <FormularioComplyEDocs2
          data={mockStep2DataEDocs}
          formData={mockFormDataEDocs}
          onUpdate={vi.fn()}
          onPrev={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      // Assert - O componente deve renderizar sem erros
      expect(screen.getByText('Questionário Técnico')).toBeInTheDocument();
    });
  });
});