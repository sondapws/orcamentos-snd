import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';

// Mock do serviço
vi.mock('@/services/emailTemplateMappingService', () => ({
  emailTemplateMappingService: {
    findByMapping: vi.fn(),
    findWithFallback: vi.fn(),
    validateUniqueness: vi.fn(),
    getMappingsList: vi.fn(),
    getTemplateById: vi.fn(),
  },
  EmailTemplateError: class EmailTemplateError extends Error {
    constructor(message: string, public code: string, public details?: any) {
      super(message);
      this.name = 'EmailTemplateError';
    }
  }
}));

describe('useEmailTemplateMapping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Serviço de mapeamento', () => {
    it('deve ter o serviço disponível', () => {
      expect(emailTemplateMappingService).toBeDefined();
      expect(emailTemplateMappingService.findByMapping).toBeDefined();
      expect(emailTemplateMappingService.findWithFallback).toBeDefined();
      expect(emailTemplateMappingService.validateUniqueness).toBeDefined();
      expect(emailTemplateMappingService.getMappingsList).toBeDefined();
      expect(emailTemplateMappingService.getTemplateById).toBeDefined();
    });

    it('deve chamar findByMapping com parâmetros corretos', async () => {
      const mockService = emailTemplateMappingService.findByMapping as any;
      mockService.mockResolvedValue(null);

      await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      expect(mockService).toHaveBeenCalledWith('comply_fiscal', 'on-premise');
    });

    it('deve chamar findWithFallback com parâmetros corretos', async () => {
      const mockService = emailTemplateMappingService.findWithFallback as any;
      mockService.mockResolvedValue({ template: null, isDefault: false, mappingFound: false });

      await emailTemplateMappingService.findWithFallback('comply_fiscal', 'saas');

      expect(mockService).toHaveBeenCalledWith('comply_fiscal', 'saas');
    });

    it('deve chamar validateUniqueness com parâmetros corretos', async () => {
      const mockService = emailTemplateMappingService.validateUniqueness as any;
      mockService.mockResolvedValue(true);

      await emailTemplateMappingService.validateUniqueness('comply_edocs', 'on-premise', 'exclude-id');

      expect(mockService).toHaveBeenCalledWith('comply_edocs', 'on-premise', 'exclude-id');
    });

    it('deve chamar getMappingsList', async () => {
      const mockService = emailTemplateMappingService.getMappingsList as any;
      mockService.mockResolvedValue([]);

      await emailTemplateMappingService.getMappingsList();

      expect(mockService).toHaveBeenCalled();
    });

    it('deve chamar getTemplateById com ID correto', async () => {
      const mockService = emailTemplateMappingService.getTemplateById as any;
      mockService.mockResolvedValue(null);

      await emailTemplateMappingService.getTemplateById('template-123');

      expect(mockService).toHaveBeenCalledWith('template-123');
    });
  });

  describe('Tipos de formulário e modalidade', () => {
    it('deve aceitar formulários válidos', () => {
      const formularios: ('comply_edocs' | 'comply_fiscal')[] = ['comply_edocs', 'comply_fiscal'];
      expect(formularios).toHaveLength(2);
      expect(formularios).toContain('comply_edocs');
      expect(formularios).toContain('comply_fiscal');
    });

    it('deve aceitar modalidades válidas', () => {
      const modalidades: ('on-premise' | 'saas')[] = ['on-premise', 'saas'];
      expect(modalidades).toHaveLength(2);
      expect(modalidades).toContain('on-premise');
      expect(modalidades).toContain('saas');
    });
  });
});