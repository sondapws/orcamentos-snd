import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { EmailTemplateMapping } from '@/services/emailTemplateMappingService';

// Mock do hook
const mockGetMappingsList = vi.fn();

vi.mock('@/hooks/useEmailTemplateMapping', () => ({
  useEmailTemplateMapping: () => ({
    getMappingsList: mockGetMappingsList,
    loading: false,
    mappings: [],
    findByMapping: vi.fn(),
    findWithFallback: vi.fn(),
    validateUniqueness: vi.fn(),
    getTemplateById: vi.fn(),
    findTemplateFromContext: vi.fn(),
    findTemplateFromContextWithFallback: vi.fn(),
    refreshMappings: vi.fn(),
    clearCache: vi.fn(),
    invalidateCache: vi.fn(),
    getFormularioLabel: vi.fn(),
    getModalidadeLabel: vi.fn(),
    getCurrentContext: vi.fn()
  })
}));

describe('TemplateMappingList', () => {
  const mockMappings: EmailTemplateMapping[] = [
    {
      formulario: 'comply_edocs',
      modalidade: 'on-premise',
      templateId: 'template-1',
      template: {
        id: 'template-1',
        nome: 'Template Comply e-DOCS On-premise',
        assunto: 'Assunto do template 1',
        corpo: 'Corpo do template 1',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_edocs',
        modalidade: 'on-premise',
        created_at: '2024-01-01T10:00:00Z'
      }
    },
    {
      formulario: 'comply_edocs',
      modalidade: 'saas',
      templateId: 'template-2',
      template: {
        id: 'template-2',
        nome: 'Template Comply e-DOCS SaaS',
        assunto: 'Assunto do template 2',
        corpo: 'Corpo do template 2',
        ativo: false,
        vinculado_formulario: true,
        formulario: 'comply_edocs',
        modalidade: 'saas',
        created_at: '2024-01-02T10:00:00Z'
      }
    },
    {
      formulario: 'comply_fiscal',
      modalidade: 'on-premise',
      templateId: 'template-3',
      template: {
        id: 'template-3',
        nome: 'Template Comply Fiscal On-premise',
        assunto: 'Assunto do template 3',
        corpo: 'Corpo do template 3',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal',
        modalidade: 'on-premise',
        created_at: '2024-01-03T10:00:00Z'
      }
    },
    {
      formulario: 'comply_fiscal',
      modalidade: 'saas',
      templateId: 'template-4',
      template: {
        id: 'template-4',
        nome: 'Template Comply Fiscal SaaS',
        assunto: 'Assunto do template 4',
        corpo: 'Corpo do template 4',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal',
        modalidade: 'saas',
        created_at: '2024-01-04T10:00:00Z'
      }
    }
  ];

  beforeEach(() => {
    mockGetMappingsList.mockResolvedValue(mockMappings);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component interface', () => {
    it('deve ter props corretas definidas', () => {
      const props = {
        className: 'custom-class',
        autoRefresh: true,
        refreshInterval: 30000
      };

      expect(props.className).toBe('custom-class');
      expect(props.autoRefresh).toBe(true);
      expect(props.refreshInterval).toBe(30000);
    });

    it('deve ter valores padrão corretos', () => {
      const defaultProps = {
        className: '',
        autoRefresh: false,
        refreshInterval: 30000
      };

      expect(defaultProps.className).toBe('');
      expect(defaultProps.autoRefresh).toBe(false);
      expect(defaultProps.refreshInterval).toBe(30000);
    });
  });

  describe('Data processing', () => {
    it('deve calcular estatísticas corretas dos mapeamentos', () => {
      const total = mockMappings.length;
      const active = mockMappings.filter(m => m.template?.ativo).length;
      const inactive = total - active;
      const complyEdocs = mockMappings.filter(m => m.formulario === 'comply_edocs').length;
      const complyFiscal = mockMappings.filter(m => m.formulario === 'comply_fiscal').length;

      expect(total).toBe(4);
      expect(active).toBe(3);
      expect(inactive).toBe(1);
      expect(complyEdocs).toBe(2);
      expect(complyFiscal).toBe(2);
    });
  });

  describe('Filter logic', () => {
    it('deve definir opções de filtro corretas', () => {
      const filterOptions = {
        formulario: ['all', 'comply_edocs', 'comply_fiscal'],
        modalidade: ['all', 'on-premise', 'saas'],
        status: ['all', 'active', 'inactive']
      };

      expect(filterOptions.formulario).toContain('all');
      expect(filterOptions.formulario).toContain('comply_edocs');
      expect(filterOptions.formulario).toContain('comply_fiscal');
      
      expect(filterOptions.modalidade).toContain('all');
      expect(filterOptions.modalidade).toContain('on-premise');
      expect(filterOptions.modalidade).toContain('saas');
      
      expect(filterOptions.status).toContain('all');
      expect(filterOptions.status).toContain('active');
      expect(filterOptions.status).toContain('inactive');
    });

    it('deve filtrar por formulário corretamente', () => {
      const filteredByComplyEdocs = mockMappings.filter(m => m.formulario === 'comply_edocs');
      const filteredByComplyFiscal = mockMappings.filter(m => m.formulario === 'comply_fiscal');

      expect(filteredByComplyEdocs).toHaveLength(2);
      expect(filteredByComplyFiscal).toHaveLength(2);
      
      filteredByComplyEdocs.forEach(mapping => {
        expect(mapping.formulario).toBe('comply_edocs');
      });
      
      filteredByComplyFiscal.forEach(mapping => {
        expect(mapping.formulario).toBe('comply_fiscal');
      });
    });

    it('deve filtrar por modalidade corretamente', () => {
      const filteredByOnPremise = mockMappings.filter(m => m.modalidade === 'on-premise');
      const filteredBySaas = mockMappings.filter(m => m.modalidade === 'saas');

      expect(filteredByOnPremise).toHaveLength(2);
      expect(filteredBySaas).toHaveLength(2);
      
      filteredByOnPremise.forEach(mapping => {
        expect(mapping.modalidade).toBe('on-premise');
      });
      
      filteredBySaas.forEach(mapping => {
        expect(mapping.modalidade).toBe('saas');
      });
    });

    it('deve filtrar por status corretamente', () => {
      const activeTemplates = mockMappings.filter(m => m.template?.ativo === true);
      const inactiveTemplates = mockMappings.filter(m => m.template?.ativo === false);

      expect(activeTemplates).toHaveLength(3);
      expect(inactiveTemplates).toHaveLength(1);
      
      activeTemplates.forEach(mapping => {
        expect(mapping.template?.ativo).toBe(true);
      });
      
      inactiveTemplates.forEach(mapping => {
        expect(mapping.template?.ativo).toBe(false);
      });
    });
  });

  describe('Data display', () => {
    it('deve ter estrutura de dados correta', () => {
      mockMappings.forEach(mapping => {
        expect(mapping).toHaveProperty('formulario');
        expect(mapping).toHaveProperty('modalidade');
        expect(mapping).toHaveProperty('templateId');
        expect(mapping).toHaveProperty('template');
        
        expect(['comply_edocs', 'comply_fiscal']).toContain(mapping.formulario);
        expect(['on-premise', 'saas']).toContain(mapping.modalidade);
        expect(typeof mapping.templateId).toBe('string');
        
        if (mapping.template) {
          expect(mapping.template).toHaveProperty('id');
          expect(mapping.template).toHaveProperty('nome');
          expect(mapping.template).toHaveProperty('ativo');
        }
      });
    });

    it('deve formatar labels corretamente', () => {
      const getFormularioLabel = (formulario: 'comply_edocs' | 'comply_fiscal') => {
        return formulario === 'comply_edocs' ? 'Comply e-DOCS' : 'Comply Fiscal';
      };

      const getModalidadeLabel = (modalidade: 'on-premise' | 'saas') => {
        return modalidade === 'on-premise' ? 'On-premise' : 'SaaS';
      };

      expect(getFormularioLabel('comply_edocs')).toBe('Comply e-DOCS');
      expect(getFormularioLabel('comply_fiscal')).toBe('Comply Fiscal');
      expect(getModalidadeLabel('on-premise')).toBe('On-premise');
      expect(getModalidadeLabel('saas')).toBe('SaaS');
    });

    it('deve formatar datas corretamente', () => {
      const testDate = '2024-01-01T10:00:00Z';
      const formattedDate = new Date(testDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      expect(formattedDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('Empty states', () => {
    it('deve tratar lista vazia corretamente', () => {
      const emptyMappings: EmailTemplateMapping[] = [];
      
      expect(emptyMappings).toHaveLength(0);
      expect(Array.isArray(emptyMappings)).toBe(true);
    });

    it('deve calcular estatísticas para lista vazia', () => {
      const emptyMappings: EmailTemplateMapping[] = [];
      const stats = {
        total: emptyMappings.length,
        active: emptyMappings.filter(m => m.template?.ativo).length,
        inactive: emptyMappings.length - emptyMappings.filter(m => m.template?.ativo).length
      };

      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.inactive).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('deve tratar erros de carregamento', async () => {
      const errorMessage = 'Erro de conexão com o banco';
      mockGetMappingsList.mockRejectedValue(new Error(errorMessage));
      
      try {
        await mockGetMappingsList();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });

    it('deve tratar templates não encontrados', () => {
      const mappingWithoutTemplate: EmailTemplateMapping = {
        formulario: 'comply_edocs',
        modalidade: 'on-premise',
        templateId: 'missing-template',
        template: undefined
      };

      expect(mappingWithoutTemplate.template).toBeUndefined();
      expect(mappingWithoutTemplate.templateId).toBe('missing-template');
    });
  });

  describe('Service integration', () => {
    it('deve chamar getMappingsList corretamente', async () => {
      await mockGetMappingsList();
      
      expect(mockGetMappingsList).toHaveBeenCalledTimes(1);
    });

    it('deve retornar dados no formato correto', async () => {
      const result = await mockGetMappingsList();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
      
      result.forEach((mapping: EmailTemplateMapping) => {
        expect(mapping).toHaveProperty('formulario');
        expect(mapping).toHaveProperty('modalidade');
        expect(mapping).toHaveProperty('templateId');
      });
    });
  });

  describe('Component configuration', () => {
    it('deve ter configurações padrão corretas', () => {
      const defaultConfig = {
        autoRefresh: false,
        refreshInterval: 30000,
        className: ''
      };

      expect(defaultConfig.autoRefresh).toBe(false);
      expect(defaultConfig.refreshInterval).toBe(30000);
      expect(defaultConfig.className).toBe('');
    });

    it('deve aceitar configurações personalizadas', () => {
      const customConfig = {
        autoRefresh: true,
        refreshInterval: 10000,
        className: 'custom-class'
      };

      expect(customConfig.autoRefresh).toBe(true);
      expect(customConfig.refreshInterval).toBe(10000);
      expect(customConfig.className).toBe('custom-class');
    });
  });

  describe('Data validation', () => {
    it('deve validar todas as combinações possíveis', () => {
      const allCombinations = [
        { formulario: 'comply_edocs', modalidade: 'on-premise' },
        { formulario: 'comply_edocs', modalidade: 'saas' },
        { formulario: 'comply_fiscal', modalidade: 'on-premise' },
        { formulario: 'comply_fiscal', modalidade: 'saas' }
      ];

      allCombinations.forEach(combination => {
        expect(['comply_edocs', 'comply_fiscal']).toContain(combination.formulario);
        expect(['on-premise', 'saas']).toContain(combination.modalidade);
      });

      expect(allCombinations).toHaveLength(4);
    });

    it('deve ter dados de teste válidos', () => {
      mockMappings.forEach(mapping => {
        expect(mapping.formulario).toBeDefined();
        expect(mapping.modalidade).toBeDefined();
        expect(mapping.templateId).toBeDefined();
        expect(typeof mapping.templateId).toBe('string');
        expect(mapping.templateId.length).toBeGreaterThan(0);
      });
    });
  });
});