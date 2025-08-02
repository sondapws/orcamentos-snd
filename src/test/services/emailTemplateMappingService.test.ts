import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailTemplateMappingService } from '@/services/emailTemplateMappingService';
import type { EmailTemplate } from '@/types/approval';
import { EmailTemplateError } from '@/errors/EmailTemplateError';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

vi.mock('@/config/emailTemplateConfig', () => ({
  emailTemplateFallbackConfigManager: {
    isLoggingEnabled: vi.fn(() => false),
    shouldLogFallbackUsage: vi.fn(() => false),
    shouldLogMappingNotFound: vi.fn(() => false),
    getDefaultTemplate: vi.fn(() => null),
    shouldUseAnyActiveTemplateAsFallback: vi.fn(() => false),
    getGlobalFallbackTemplate: vi.fn(() => null),
    shouldFailWhenNoTemplateFound: vi.fn(() => false),
    setDefaultTemplate: vi.fn(),
    setGlobalFallbackTemplate: vi.fn(),
    getConfig: vi.fn(() => ({})),
    updateConfig: vi.fn()
  }
}));

vi.mock('@/services/auditLogger', () => ({
  auditLogger: {
    logError: vi.fn(),
    logTemplateSearch: vi.fn(),
    logOperation: vi.fn(),
    logFallbackUsage: vi.fn()
  }
}));

vi.mock('@/services/errorRecoveryService', () => ({
  errorRecoveryService: {
    executeWithRecovery: vi.fn((fn) => fn().then(result => ({ success: true, result })))
  }
}));

vi.mock('@/services/adminNotificationService', () => ({
  adminNotificationService: {
    notifyError: vi.fn(),
    notifyConfigurationIssue: vi.fn()
  }
}));

describe('EmailTemplateMappingService', () => {
  let service: EmailTemplateMappingService;
  let mockSupabase: any;

  // Mock template data
  const mockTemplate: EmailTemplate = {
    id: 'template-123',
    nome: 'Template Comply Fiscal On-Premise',
    assunto: 'Assunto do Template',
    corpo: 'Corpo do template',
    descricao: 'Descrição do template',
    tipo: 'orcamento',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_fiscal',
    modalidade: 'on-premise',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockTemplateEdocs: EmailTemplate = {
    id: 'template-456',
    nome: 'Template Comply e-DOCS SaaS',
    assunto: 'Assunto e-DOCS',
    corpo: 'Corpo e-DOCS',
    descricao: 'Template para e-DOCS',
    tipo: 'orcamento',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_edocs',
    modalidade: 'saas',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    service = new EmailTemplateMappingService();
    
    // Get the mocked supabase instance
    const { supabase } = await import('@/integrations/supabase/client');
    mockSupabase = supabase;
    
    vi.clearAllMocks();
  });

  describe('findByMapping', () => {
    it('should find template for comply_fiscal + on-premise combination', async () => {
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: [mockTemplate], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.findByMapping('comply_fiscal', 'on-premise');

      expect(result).toEqual(mockTemplate);
      expect(mockSupabase.from).toHaveBeenCalledWith('email_templates');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq1).toHaveBeenCalledWith('vinculado_formulario', true);
      expect(mockEq2).toHaveBeenCalledWith('ativo', true);
      expect(mockEq3).toHaveBeenCalledWith('formulario', 'comply_fiscal');
      expect(mockEq4).toHaveBeenCalledWith('modalidade', 'on-premise');
    });

    it('should find template for comply_edocs + saas combination', async () => {
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: [mockTemplateEdocs], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.findByMapping('comply_edocs', 'saas');

      expect(result).toEqual(mockTemplateEdocs);
      expect(mockEq3).toHaveBeenCalledWith('formulario', 'comply_edocs');
      expect(mockEq4).toHaveBeenCalledWith('modalidade', 'saas');
    });

    it('should return null when no template found for combination', async () => {
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.findByMapping('comply_fiscal', 'saas');

      expect(result).toBeNull();
    });

    it('should throw EmailTemplateError on database error', async () => {
      const dbError = { message: 'Database connection failed', code: 'CONNECTION_ERROR' };
      
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(service.findByMapping('comply_fiscal', 'on-premise'))
        .rejects.toThrow(EmailTemplateError);
    });

    it('should handle all valid form and modality combinations', async () => {
      const combinations = [
        { formulario: 'comply_fiscal' as const, modalidade: 'on-premise' as const },
        { formulario: 'comply_fiscal' as const, modalidade: 'saas' as const },
        { formulario: 'comply_edocs' as const, modalidade: 'on-premise' as const },
        { formulario: 'comply_edocs' as const, modalidade: 'saas' as const }
      ];

      for (const combo of combinations) {
        // Setup mock chain for each combination
        const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
        const mockLimit = vi.fn().mockReturnValue(mockQuery);
        const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
        const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
        const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
        const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
        const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
        mockSupabase.from.mockReturnValue({ select: mockSelect });

        const result = await service.findByMapping(combo.formulario, combo.modalidade);
        
        expect(result).toBeNull(); // No templates found in this test
        expect(mockEq3).toHaveBeenCalledWith('formulario', combo.formulario);
        expect(mockEq4).toHaveBeenCalledWith('modalidade', combo.modalidade);
        
        vi.clearAllMocks();
      }
    });
  });

  describe('validateUniqueness', () => {
    it('should return true when combination is unique', async () => {
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq4 = vi.fn().mockReturnValue(mockQuery);
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.validateUniqueness('comply_fiscal', 'on-premise');

      expect(result).toBe(true);
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq1).toHaveBeenCalledWith('vinculado_formulario', true);
      expect(mockEq2).toHaveBeenCalledWith('ativo', true);
      expect(mockEq3).toHaveBeenCalledWith('formulario', 'comply_fiscal');
      expect(mockEq4).toHaveBeenCalledWith('modalidade', 'on-premise');
    });

    it('should return false when combination already exists', async () => {
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ 
        data: [{ id: 'existing-template' }], 
        error: null 
      });
      const mockEq4 = vi.fn().mockReturnValue(mockQuery);
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.validateUniqueness('comply_edocs', 'saas');

      expect(result).toBe(false);
    });

    it('should exclude specified template ID when validating for edit', async () => {
      // Setup mock chain with neq
      const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockNeq = vi.fn().mockReturnValue(mockQuery);
      const mockEq4 = vi.fn().mockReturnValue({ neq: mockNeq });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.validateUniqueness('comply_fiscal', 'on-premise', 'template-to-exclude');

      expect(result).toBe(true);
      expect(mockNeq).toHaveBeenCalledWith('id', 'template-to-exclude');
    });

    it('should throw EmailTemplateError on database error', async () => {
      const dbError = { message: 'Database error', code: 'DB_ERROR' };
      
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const mockEq4 = vi.fn().mockReturnValue(mockQuery);
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(service.validateUniqueness('comply_fiscal', 'on-premise'))
        .rejects.toThrow(EmailTemplateError);
    });

    it('should validate uniqueness for all form and modality combinations', async () => {
      const combinations = [
        { formulario: 'comply_fiscal' as const, modalidade: 'on-premise' as const },
        { formulario: 'comply_fiscal' as const, modalidade: 'saas' as const },
        { formulario: 'comply_edocs' as const, modalidade: 'on-premise' as const },
        { formulario: 'comply_edocs' as const, modalidade: 'saas' as const }
      ];

      for (const combo of combinations) {
        // Setup mock chain for each combination
        const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
        const mockEq4 = vi.fn().mockReturnValue(mockQuery);
        const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
        const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
        const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
        mockSupabase.from.mockReturnValue({ select: mockSelect });

        const result = await service.validateUniqueness(combo.formulario, combo.modalidade);
        
        expect(result).toBe(true);
        expect(mockEq3).toHaveBeenCalledWith('formulario', combo.formulario);
        expect(mockEq4).toHaveBeenCalledWith('modalidade', combo.modalidade);
        
        vi.clearAllMocks();
      }
    });
  });

  describe('getMappingsList', () => {
    it('should return list of all active mappings', async () => {
      const mockMappings = [mockTemplate, mockTemplateEdocs];
      
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: mockMappings, error: null });
      const mockOrder2 = vi.fn().mockReturnValue(mockQuery);
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockNot2 = vi.fn().mockReturnValue({ order: mockOrder1 });
      const mockNot1 = vi.fn().mockReturnValue({ not: mockNot2 });
      const mockEq3 = vi.fn().mockReturnValue({ not: mockNot1 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getMappingsList();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        formulario: 'comply_fiscal',
        modalidade: 'on-premise',
        templateId: 'template-123',
        template: mockTemplate
      });
      expect(result[1]).toEqual({
        formulario: 'comply_edocs',
        modalidade: 'saas',
        templateId: 'template-456',
        template: mockTemplateEdocs
      });
    });

    it('should return empty array when no mappings exist', async () => {
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder2 = vi.fn().mockReturnValue(mockQuery);
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockNot2 = vi.fn().mockReturnValue({ order: mockOrder1 });
      const mockNot1 = vi.fn().mockReturnValue({ not: mockNot2 });
      const mockEq3 = vi.fn().mockReturnValue({ not: mockNot1 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getMappingsList();

      expect(result).toEqual([]);
    });

    it('should filter out templates without formulario or modalidade', async () => {
      const mockTemplateWithoutMapping = {
        ...mockTemplate,
        formulario: null,
        modalidade: null
      };
      
      // Setup mock chain
      const mockQuery = vi.fn().mockResolvedValue({ 
        data: [mockTemplate, mockTemplateWithoutMapping], 
        error: null 
      });
      const mockOrder2 = vi.fn().mockReturnValue(mockQuery);
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockNot2 = vi.fn().mockReturnValue({ order: mockOrder1 });
      const mockNot1 = vi.fn().mockReturnValue({ not: mockNot2 });
      const mockEq3 = vi.fn().mockReturnValue({ not: mockNot1 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getMappingsList();

      expect(result).toHaveLength(1);
      expect(result[0].templateId).toBe('template-123');
    });
  });

  describe('getTemplateById', () => {
    it('should return template when found and active', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ data: mockTemplate, error: null });
      const mockSingle = vi.fn().mockReturnValue(mockQuery);
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getTemplateById('template-123');

      expect(result).toEqual(mockTemplate);
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq1).toHaveBeenCalledWith('id', 'template-123');
      expect(mockEq2).toHaveBeenCalledWith('ativo', true);
    });

    it('should return null when template not found', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows found' } 
      });
      const mockSingle = vi.fn().mockReturnValue(mockQuery);
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.getTemplateById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw EmailTemplateError on database error', async () => {
      const dbError = { message: 'Database error', code: 'DB_ERROR' };
      const mockQuery = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const mockSingle = vi.fn().mockReturnValue(mockQuery);
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(service.getTemplateById('template-123'))
        .rejects.toThrow(EmailTemplateError);
    });
  });

  describe('Performance Tests', () => {
    it('should complete findByMapping within reasonable time', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ data: [mockTemplate], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const startTime = Date.now();
      await service.findByMapping('comply_fiscal', 'on-premise');
      const duration = Date.now() - startTime;

      // Should complete within 100ms (generous for unit test)
      expect(duration).toBeLessThan(100);
    });

    it('should complete validateUniqueness within reasonable time', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq4 = vi.fn().mockReturnValue(mockQuery);
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const startTime = Date.now();
      await service.validateUniqueness('comply_fiscal', 'on-premise');
      const duration = Date.now() - startTime;

      // Should complete within 100ms (generous for unit test)
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple concurrent findByMapping calls efficiently', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ data: [mockTemplate], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const startTime = Date.now();
      
      // Execute 10 concurrent calls
      const promises = Array.from({ length: 10 }, () => 
        service.findByMapping('comply_fiscal', 'on-premise')
      );
      
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      // All should return the same template
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual(mockTemplate);
      });

      // Should complete within 200ms for 10 concurrent calls
      expect(duration).toBeLessThan(200);
    });

    it('should verify database queries use proper indexing structure', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ data: [mockTemplate], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await service.findByMapping('comply_fiscal', 'on-premise');

      // Verify the query structure that would benefit from composite index
      expect(mockEq1).toHaveBeenCalledWith('vinculado_formulario', true);
      expect(mockEq2).toHaveBeenCalledWith('ativo', true);
      expect(mockEq3).toHaveBeenCalledWith('formulario', 'comply_fiscal');
      expect(mockEq4).toHaveBeenCalledWith('modalidade', 'on-premise');
      
      // The order of these conditions matches the expected composite index:
      // (formulario, modalidade) WHERE ativo = true AND vinculado_formulario = true
    });
  });

  describe('Fallback System Tests', () => {
    it('should return specific template when found in findWithFallback', async () => {
      // Setup mock for findByMapping to return specific template
      const mockQuery = vi.fn().mockResolvedValue({ data: [mockTemplate], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq4 = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await service.findWithFallback('comply_fiscal', 'on-premise');

      expect(result.template).toEqual(mockTemplate);
      expect(result.isDefault).toBe(false);
      expect(result.mappingFound).toBe(true);
      expect(result.fallbackType).toBe('specific');
    });

    it('should use form default template when specific not found', async () => {
      // Multiple calls: findByMapping (empty), form default (found)
      let callCount = 0;
      const mockQuery = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // findByMapping call
          return Promise.resolve({ data: [], error: null });
        } else {
          // form default call
          return Promise.resolve({ data: [mockTemplate], error: null });
        }
      });

      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ is: mockIs });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      // For the first call (findByMapping)
      const mockEq4b = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3b = vi.fn().mockReturnValue({ eq: mockEq4b });
      const mockEq2b = vi.fn().mockReturnValue({ eq: mockEq3b });
      const mockEq1b = vi.fn().mockReturnValue({ eq: mockEq2b });
      const mockSelectB = vi.fn().mockReturnValue({ eq: mockEq1b });

      mockSupabase.from.mockImplementation(() => {
        if (callCount <= 1) {
          return { select: mockSelectB };
        } else {
          return { select: mockSelect };
        }
      });

      const result = await service.findWithFallback('comply_fiscal', 'on-premise');

      expect(result.template).toEqual(mockTemplate);
      expect(result.isDefault).toBe(true);
      expect(result.mappingFound).toBe(false);
      expect(result.fallbackType).toBe('form_default');
    });

    it('should return null when no template found in entire fallback chain', async () => {
      // All calls return empty
      const mockQuery = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockLimit = vi.fn().mockReturnValue(mockQuery);
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3 = vi.fn().mockReturnValue({ is: mockIs });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      const mockEq4b = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq3b = vi.fn().mockReturnValue({ eq: mockEq4b });
      const mockEq2b = vi.fn().mockReturnValue({ eq: mockEq3b });
      const mockEq1b = vi.fn().mockReturnValue({ eq: mockEq2b });
      const mockSelectB = vi.fn().mockReturnValue({ eq: mockEq1b });

      mockSupabase.from.mockImplementation(() => ({ select: mockSelectB }));

      const result = await service.findWithFallback('comply_fiscal', 'on-premise');

      expect(result.template).toBeNull();
      expect(result.isDefault).toBe(false);
      expect(result.mappingFound).toBe(false);
      expect(result.fallbackType).toBe('none');
    });
  });
});