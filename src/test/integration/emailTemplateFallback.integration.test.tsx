import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { emailTemplateFallbackConfigManager } from '@/config/emailTemplateConfig';
import { useEmailTemplateMapping } from '@/hooks/useEmailTemplateMapping';
import { FormProvider } from '@/contexts/FormContext';
import React from 'react';

// Mock do serviço
vi.mock('@/services/emailTemplateMappingService', () => ({
  emailTemplateMappingService: {
    findWithFallback: vi.fn(),
    setDefaultTemplate: vi.fn(),
    setGlobalFallbackTemplate: vi.fn(),
    getFallbackConfig: vi.fn(),
    updateFallbackConfig: vi.fn(),
  }
}));

// Componente de teste que usa o hook
const TestComponent: React.FC<{ formulario: string; modalidade: string }> = ({ 
  formulario, 
  modalidade 
}) => {
  const { findWithFallback, loading } = useEmailTemplateMapping();
  const [result, setResult] = React.useState<any>(null);

  const handleTest = async () => {
    const templateResult = await findWithFallback(
      formulario as 'comply_fiscal' | 'comply_edocs',
      modalidade as 'on-premise' | 'saas'
    );
    setResult(templateResult);
  };

  return (
    <div>
      <button onClick={handleTest} disabled={loading}>
        Testar Fallback
      </button>
      {result && (
        <div data-testid="result">
          <div data-testid="template-name">
            {result.template ? result.template.nome : 'Nenhum template'}
          </div>
          <div data-testid="is-default">{result.isDefault ? 'Padrão' : 'Específico'}</div>
          <div data-testid="mapping-found">{result.mappingFound ? 'Mapeamento encontrado' : 'Sem mapeamento'}</div>
          <div data-testid="fallback-type">{result.fallbackType || 'N/A'}</div>
          <div data-testid="fallback-reason">{result.fallbackReason || 'N/A'}</div>
        </div>
      )}
    </div>
  );
};

describe('EmailTemplateFallback Integration', () => {
  const mockSpecificTemplate = {
    id: 'specific-template',
    nome: 'Template Específico',
    assunto: 'Assunto Específico',
    corpo: 'Corpo específico',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_fiscal' as const,
    modalidade: 'on-premise' as const
  };

  const mockDefaultTemplate = {
    id: 'default-template',
    nome: 'Template Padrão',
    assunto: 'Assunto Padrão',
    corpo: 'Corpo padrão',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_fiscal' as const,
    modalidade: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset configuração
    emailTemplateFallbackConfigManager.updateConfig({
      defaultTemplates: {},
      globalFallbackTemplate: undefined,
      logging: { enabled: false, logFallbackUsage: false, logMappingNotFound: false },
      behavior: { useAnyActiveTemplateAsFallback: true, failWhenNoTemplateFound: false }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve usar template específico quando disponível', async () => {
    // Arrange
    const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);
    mockFindWithFallback.mockResolvedValue({
      template: mockSpecificTemplate,
      isDefault: false,
      mappingFound: true,
      fallbackType: 'specific',
      fallbackReason: 'Template específico encontrado'
    });

    render(
      <FormProvider>
        <TestComponent formulario="comply_fiscal" modalidade="on-premise" />
      </FormProvider>
    );

    // Act
    fireEvent.click(screen.getByText('Testar Fallback'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('template-name')).toHaveTextContent('Template Específico');
      expect(screen.getByTestId('is-default')).toHaveTextContent('Específico');
      expect(screen.getByTestId('mapping-found')).toHaveTextContent('Mapeamento encontrado');
      expect(screen.getByTestId('fallback-type')).toHaveTextContent('specific');
    });

    expect(mockFindWithFallback).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
  });

  it('deve usar template padrão configurado quando específico não encontrado', async () => {
    // Arrange
    const mockConfiguredTemplate = {
      ...mockDefaultTemplate,
      id: 'configured-default',
      nome: 'Template Configurado'
    };

    const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);
    mockFindWithFallback.mockResolvedValue({
      template: mockConfiguredTemplate,
      isDefault: true,
      mappingFound: false,
      fallbackType: 'configured_default',
      fallbackReason: 'Template padrão configurado usado'
    });

    render(
      <FormProvider>
        <TestComponent formulario="comply_fiscal" modalidade="saas" />
      </FormProvider>
    );

    // Act
    fireEvent.click(screen.getByText('Testar Fallback'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('template-name')).toHaveTextContent('Template Configurado');
      expect(screen.getByTestId('is-default')).toHaveTextContent('Padrão');
      expect(screen.getByTestId('mapping-found')).toHaveTextContent('Sem mapeamento');
      expect(screen.getByTestId('fallback-type')).toHaveTextContent('configured_default');
    });
  });

  it('deve usar template padrão do formulário quando configurado não existe', async () => {
    // Arrange
    const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);
    mockFindWithFallback.mockResolvedValue({
      template: mockDefaultTemplate,
      isDefault: true,
      mappingFound: false,
      fallbackType: 'form_default',
      fallbackReason: 'Template padrão do formulário usado'
    });

    render(
      <FormProvider>
        <TestComponent formulario="comply_fiscal" modalidade="saas" />
      </FormProvider>
    );

    // Act
    fireEvent.click(screen.getByText('Testar Fallback'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('template-name')).toHaveTextContent('Template Padrão');
      expect(screen.getByTestId('is-default')).toHaveTextContent('Padrão');
      expect(screen.getByTestId('fallback-type')).toHaveTextContent('form_default');
    });
  });

  it('deve usar qualquer template ativo quando nenhum padrão existe', async () => {
    // Arrange
    const mockAnyActiveTemplate = {
      ...mockDefaultTemplate,
      id: 'any-active',
      nome: 'Qualquer Template Ativo'
    };

    const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);
    mockFindWithFallback.mockResolvedValue({
      template: mockAnyActiveTemplate,
      isDefault: true,
      mappingFound: false,
      fallbackType: 'any_active',
      fallbackReason: 'Qualquer template ativo usado'
    });

    render(
      <FormProvider>
        <TestComponent formulario="comply_edocs" modalidade="on-premise" />
      </FormProvider>
    );

    // Act
    fireEvent.click(screen.getByText('Testar Fallback'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('template-name')).toHaveTextContent('Qualquer Template Ativo');
      expect(screen.getByTestId('fallback-type')).toHaveTextContent('any_active');
    });
  });

  it('deve usar template global de fallback como último recurso', async () => {
    // Arrange
    const mockGlobalTemplate = {
      ...mockDefaultTemplate,
      id: 'global-fallback',
      nome: 'Template Global'
    };

    const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);
    mockFindWithFallback.mockResolvedValue({
      template: mockGlobalTemplate,
      isDefault: true,
      mappingFound: false,
      fallbackType: 'global_fallback',
      fallbackReason: 'Template global de fallback usado'
    });

    render(
      <FormProvider>
        <TestComponent formulario="comply_edocs" modalidade="saas" />
      </FormProvider>
    );

    // Act
    fireEvent.click(screen.getByText('Testar Fallback'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('template-name')).toHaveTextContent('Template Global');
      expect(screen.getByTestId('fallback-type')).toHaveTextContent('global_fallback');
    });
  });

  it('deve retornar null quando nenhum template é encontrado', async () => {
    // Arrange
    const mockFindWithFallback = vi.mocked(emailTemplateMappingService.findWithFallback);
    mockFindWithFallback.mockResolvedValue({
      template: null,
      isDefault: false,
      mappingFound: false,
      fallbackType: 'none',
      fallbackReason: 'Nenhum template encontrado'
    });

    render(
      <FormProvider>
        <TestComponent formulario="comply_fiscal" modalidade="on-premise" />
      </FormProvider>
    );

    // Act
    fireEvent.click(screen.getByText('Testar Fallback'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('template-name')).toHaveTextContent('Nenhum template');
      expect(screen.getByTestId('fallback-type')).toHaveTextContent('none');
    });
  });
});