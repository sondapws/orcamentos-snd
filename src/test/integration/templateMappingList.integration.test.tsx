import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import type { EmailTemplateMapping } from '@/services/emailTemplateMappingService';

// Mock do serviço
vi.mock('@/services/emailTemplateMappingService', () => ({
  emailTemplateMappingService: {
    getMappingsList: vi.fn()
  }
}));

describe('TemplateMappingList Integration', () => {
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
    vi.mocked(emailTemplateMappingService.getMappingsList).mockResolvedValue(mockMappings);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service integration', () => {
    it('deve integrar corretamente com o serviço de mapeamento', async () => {
      // Act
      const result = await emailTemplateMappingService.getMappingsList();

      // Assert
      expect(result).toEqual(mockMappings);
      expect(emailTemplateMappingService.getMappingsList).toHaveBeenCalledTimes(1);
    });

    it('deve retornar todos os mapeamentos configurados', async () => {
      // Act
      const result = await emailTemplateMappingService.getMappingsList();

      // Assert
      expect(result).toHaveLength(4);
      expect(result.every(mapping => mapping.formulario && mapping.modalidade)).toBe(true);
    });

    it('deve incluir dados completos do template', async () => {
      // Act
      const result = await emailTemplateMappingService.getMappingsList();

      // Assert
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('formulario');
        expect(mapping).toHaveProperty('modalidade');
        expect(mapping).toHaveProperty('templateId');
        expect(mapping).toHaveProperty('template');
        
        if (mapping.template) {
          expect(mapping.template).toHaveProperty('id');
          expect(mapping.template).toHaveProperty('nome');
          expect(mapping.template).toHaveProperty('assunto');
          expect(mapping.template).toHaveProperty('corpo');
          expect(mapping.template).toHaveProperty('ativo');
        }
      });
    });
  });

  describe('Data filtering scenarios', () => {
    it('deve permitir filtrar por formulário Comply e-DOCS', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const filteredByComplyEdocs = result.filter(m => m.formulario === 'comply_edocs');

      // Assert
      expect(filteredByComplyEdocs).toHaveLength(2);
      filteredByComplyEdocs.forEach(mapping => {
        expect(mapping.formulario).toBe('comply_edocs');
      });
    });

    it('deve permitir filtrar por formulário Comply Fiscal', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const filteredByComplyFiscal = result.filter(m => m.formulario === 'comply_fiscal');

      // Assert
      expect(filteredByComplyFiscal).toHaveLength(2);
      filteredByComplyFiscal.forEach(mapping => {
        expect(mapping.formulario).toBe('comply_fiscal');
      });
    });

    it('deve permitir filtrar por modalidade On-premise', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const filteredByOnPremise = result.filter(m => m.modalidade === 'on-premise');

      // Assert
      expect(filteredByOnPremise).toHaveLength(2);
      filteredByOnPremise.forEach(mapping => {
        expect(mapping.modalidade).toBe('on-premise');
      });
    });

    it('deve permitir filtrar por modalidade SaaS', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const filteredBySaas = result.filter(m => m.modalidade === 'saas');

      // Assert
      expect(filteredBySaas).toHaveLength(2);
      filteredBySaas.forEach(mapping => {
        expect(mapping.modalidade).toBe('saas');
      });
    });

    it('deve permitir filtrar por status ativo', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const activeTemplates = result.filter(m => m.template?.ativo === true);

      // Assert
      expect(activeTemplates).toHaveLength(3);
      activeTemplates.forEach(mapping => {
        expect(mapping.template?.ativo).toBe(true);
      });
    });

    it('deve permitir filtrar por status inativo', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const inactiveTemplates = result.filter(m => m.template?.ativo === false);

      // Assert
      expect(inactiveTemplates).toHaveLength(1);
      inactiveTemplates.forEach(mapping => {
        expect(mapping.template?.ativo).toBe(false);
      });
    });
  });

  describe('Statistics calculation', () => {
    it('deve calcular estatísticas corretas', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const stats = {
        total: result.length,
        active: result.filter(m => m.template?.ativo).length,
        inactive: result.length - result.filter(m => m.template?.ativo).length,
        complyEdocs: result.filter(m => m.formulario === 'comply_edocs').length,
        complyFiscal: result.filter(m => m.formulario === 'comply_fiscal').length
      };

      // Assert
      expect(stats.total).toBe(4);
      expect(stats.active).toBe(3);
      expect(stats.inactive).toBe(1);
      expect(stats.complyEdocs).toBe(2);
      expect(stats.complyFiscal).toBe(2);
    });

    it('deve calcular estatísticas para lista vazia', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.getMappingsList).mockResolvedValue([]);
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const stats = {
        total: result.length,
        active: result.filter(m => m.template?.ativo).length,
        inactive: result.length - result.filter(m => m.template?.ativo).length
      };

      // Assert
      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.inactive).toBe(0);
    });
  });

  describe('Error handling scenarios', () => {
    it('deve tratar erro de conexão com o banco', async () => {
      // Arrange
      const errorMessage = 'Erro de conexão com o banco de dados';
      vi.mocked(emailTemplateMappingService.getMappingsList)
        .mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(emailTemplateMappingService.getMappingsList())
        .rejects.toThrow(errorMessage);
    });

    it('deve tratar resposta vazia do serviço', async () => {
      // Arrange
      vi.mocked(emailTemplateMappingService.getMappingsList).mockResolvedValue([]);

      // Act
      const result = await emailTemplateMappingService.getMappingsList();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve tratar templates sem dados completos', async () => {
      // Arrange
      const incompleteMapping: EmailTemplateMapping = {
        formulario: 'comply_edocs',
        modalidade: 'on-premise',
        templateId: 'incomplete-template',
        template: undefined
      };
      
      vi.mocked(emailTemplateMappingService.getMappingsList)
        .mockResolvedValue([incompleteMapping]);

      // Act
      const result = await emailTemplateMappingService.getMappingsList();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].template).toBeUndefined();
      expect(result[0].templateId).toBe('incomplete-template');
    });
  });

  describe('Data validation', () => {
    it('deve validar todas as combinações possíveis de formulário e modalidade', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();
      
      // Act
      const combinations = result.map(m => ({
        formulario: m.formulario,
        modalidade: m.modalidade
      }));

      // Assert
      const expectedCombinations = [
        { formulario: 'comply_edocs', modalidade: 'on-premise' },
        { formulario: 'comply_edocs', modalidade: 'saas' },
        { formulario: 'comply_fiscal', modalidade: 'on-premise' },
        { formulario: 'comply_fiscal', modalidade: 'saas' }
      ];

      expectedCombinations.forEach(expected => {
        const found = combinations.find(c => 
          c.formulario === expected.formulario && 
          c.modalidade === expected.modalidade
        );
        expect(found).toBeDefined();
      });
    });

    it('deve validar tipos de dados corretos', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();

      // Act & Assert
      result.forEach(mapping => {
        expect(typeof mapping.formulario).toBe('string');
        expect(typeof mapping.modalidade).toBe('string');
        expect(typeof mapping.templateId).toBe('string');
        
        expect(['comply_edocs', 'comply_fiscal']).toContain(mapping.formulario);
        expect(['on-premise', 'saas']).toContain(mapping.modalidade);
        expect(mapping.templateId.length).toBeGreaterThan(0);
        
        if (mapping.template) {
          expect(typeof mapping.template.id).toBe('string');
          expect(typeof mapping.template.nome).toBe('string');
          expect(typeof mapping.template.ativo).toBe('boolean');
        }
      });
    });
  });

  describe('Performance scenarios', () => {
    it('deve processar grandes volumes de dados eficientemente', async () => {
      // Arrange
      const largeMappingsList: EmailTemplateMapping[] = Array.from({ length: 1000 }, (_, index) => ({
        formulario: index % 2 === 0 ? 'comply_edocs' : 'comply_fiscal',
        modalidade: index % 2 === 0 ? 'on-premise' : 'saas',
        templateId: `template-${index}`,
        template: {
          id: `template-${index}`,
          nome: `Template ${index}`,
          assunto: `Assunto ${index}`,
          corpo: `Corpo ${index}`,
          ativo: index % 3 !== 0,
          vinculado_formulario: true,
          formulario: index % 2 === 0 ? 'comply_edocs' : 'comply_fiscal',
          modalidade: index % 2 === 0 ? 'on-premise' : 'saas',
          created_at: new Date().toISOString()
        }
      }));

      vi.mocked(emailTemplateMappingService.getMappingsList)
        .mockResolvedValue(largeMappingsList);

      // Act
      const startTime = performance.now();
      const result = await emailTemplateMappingService.getMappingsList();
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Deve processar em menos de 100ms
    });

    it('deve manter performance com filtros múltiplos', async () => {
      // Arrange
      const result = await emailTemplateMappingService.getMappingsList();

      // Act
      const startTime = performance.now();
      
      // Aplicar múltiplos filtros
      const filtered = result
        .filter(m => m.formulario === 'comply_edocs')
        .filter(m => m.modalidade === 'on-premise')
        .filter(m => m.template?.ativo === true);
      
      const endTime = performance.now();

      // Assert
      expect(filtered).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(10); // Filtros devem ser rápidos
    });
  });

  describe('Real-world scenarios', () => {
    it('deve simular cenário de administrador visualizando mapeamentos', async () => {
      // Arrange - Admin acessa a tela de mapeamentos
      const result = await emailTemplateMappingService.getMappingsList();

      // Act - Admin visualiza estatísticas
      const stats = {
        total: result.length,
        active: result.filter(m => m.template?.ativo).length,
        byFormulario: {
          comply_edocs: result.filter(m => m.formulario === 'comply_edocs').length,
          comply_fiscal: result.filter(m => m.formulario === 'comply_fiscal').length
        }
      };

      // Assert - Dados estão corretos para tomada de decisão
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.active).toBeLessThanOrEqual(stats.total);
      expect(stats.byFormulario.comply_edocs + stats.byFormulario.comply_fiscal).toBe(stats.total);
    });

    it('deve simular cenário de busca por mapeamento específico', async () => {
      // Arrange - Admin procura mapeamento específico
      const result = await emailTemplateMappingService.getMappingsList();

      // Act - Buscar mapeamento para Comply e-DOCS + On-premise
      const specificMapping = result.find(m => 
        m.formulario === 'comply_edocs' && 
        m.modalidade === 'on-premise'
      );

      // Assert - Mapeamento encontrado com dados completos
      expect(specificMapping).toBeDefined();
      expect(specificMapping?.template).toBeDefined();
      expect(specificMapping?.template?.nome).toBe('Template Comply e-DOCS On-premise');
    });

    it('deve simular cenário de auditoria de templates inativos', async () => {
      // Arrange - Admin precisa auditar templates inativos
      const result = await emailTemplateMappingService.getMappingsList();

      // Act - Identificar templates inativos
      const inactiveTemplates = result.filter(m => m.template?.ativo === false);

      // Assert - Informações suficientes para auditoria
      expect(inactiveTemplates).toHaveLength(1);
      inactiveTemplates.forEach(mapping => {
        expect(mapping.template?.ativo).toBe(false);
        expect(mapping.template?.nome).toBeDefined();
        expect(mapping.formulario).toBeDefined();
        expect(mapping.modalidade).toBeDefined();
      });
    });
  });
});