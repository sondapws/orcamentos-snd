import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService, EmailTemplateError } from '@/services/emailTemplateMappingService';
import { emailTemplateFallbackConfigManager } from '@/config/emailTemplateConfig';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                is: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
                  }))
                })),
                order: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
                })),
                single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('EmailTemplateFallback', () => {
  const mockTemplate = {
    id: 'template-1',
    nome: 'Template Teste',
    assunto: 'Assunto Teste',
    corpo: 'Corpo do template',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_fiscal' as const,
    modalidade: 'on-premise' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset configuração para padrão
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

  describe('findWithFallback - Template Específico', () => {
    it('deve retornar template específico quando encontrado', async () => {
      // Arrange
      const mockSupabaseChain = {
        select: vi.fn(() => mockSupabaseChain),
        eq: vi.fn(() => mockSupabaseChain),
        order: vi.fn(() => mockSupabaseChain),
        limit: vi.fn(() => Promise.resolve({ data: [mockTemplate], error: null }))
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain as any);

      // Act
      const result = await emailTemplateMappingService.findWithFallback('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toEqual({
        template: expect.objectContaining({
          id: 'template-1',
          nome: 'Template Teste'
        }),
        isDefault: false,
        mappingFound: true,
        fallbackType: 'specific',
        fallbackReason: 'Template específico para a combinação formulário+modalidade encontrado'
      });
    });
  });

  describe('Configuração de Templates Padrão', () => {
    it('deve configurar template padrão para formulário', async () => {
      // Arrange
      const mockSupabaseChain = {
        select: vi.fn(() => mockSupabaseChain),
        eq: vi.fn(() => mockSupabaseChain),
        single: vi.fn(() => Promise.resolve({ data: mockTemplate, error: null }))
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain as any);

      // Act
      const result = await emailTemplateMappingService.setDefaultTemplate('comply_fiscal', 'template-1');

      // Assert
      expect(result).toBe(true);
      expect(emailTemplateFallbackConfigManager.getDefaultTemplate('comply_fiscal')).toBe('template-1');
    });

    it('deve retornar false se template não existe', async () => {
      // Arrange
      const mockSupabaseChain = {
        select: vi.fn(() => mockSupabaseChain),
        eq: vi.fn(() => mockSupabaseChain),
        single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
      };
      
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain as any);

      // Act
      const result = await emailTemplateMappingService.setDefaultTemplate('comply_fiscal', 'inexistente');

      // Assert
      expect(result).toBe(false);
    });
  });
});