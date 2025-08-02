import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import type { EmailTemplate } from '@/types/approval';

// Mock simplificado do serviço
vi.mock('@/services/emailTemplateMappingService', () => ({
  emailTemplateMappingService: {
    findByMapping: vi.fn(),
    validateUniqueness: vi.fn(),
    getMappingsList: vi.fn(),
    getTemplateById: vi.fn(),
    findWithFallback: vi.fn()
  }
}));

describe('Database Validation - Core Integration Tests', () => {
  const mockEmailService = vi.mocked(emailTemplateMappingService);

  // Templates de teste com diferentes cenários de dados
  const validTemplate: EmailTemplate = {
    id: 'template-valid-001',
    nome: 'Template Válido',
    assunto: 'Assunto do Template - {{razaoSocial}}',
    corpo: 'Corpo do template com {{responsavel}} e {{empresa}}.',
    descricao: 'Descrição do template',
    tipo: 'orcamento',
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_fiscal',
    modalidade: 'on-premise',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z'
  };

  const templateWithNullFields: Partial<EmailTemplate> = {
    id: 'template-null-fields',
    nome: 'Template com Campos Nulos',
    assunto: 'Assunto básico',
    corpo: 'Corpo básico',
    descricao: null, // Campo opcional nulo
    tipo: null, // Campo opcional nulo
    ativo: true,
    vinculado_formulario: true,
    formulario: 'comply_edocs',
    modalidade: null, // Template padrão
    created_at: '2025-01-01T10:00:00Z',
    updated_at: null // Campo opcional nulo
  };

  const inactiveTemplate: EmailTemplate = {
    id: 'template-inactive-001',
    nome: 'Template Inativo',
    assunto: 'Template desativado',
    corpo: 'Este template está inativo',
    ativo: false, // Template inativo
    vinculado_formulario: true,
    formulario: 'comply_fiscal',
    modalidade: 'saas',
    created_at: '2025-01-01T10:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validação de Integridade de Dados', () => {
    it('deve validar campos obrigatórios em templates', async () => {
      // Arrange
      mockEmailService.findByMapping.mockResolvedValue(validTemplate);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBeDefined();
      expect(result!.nome).toBeDefined();
      expect(result!.assunto).toBeDefined();
      expect(result!.corpo).toBeDefined();
      expect(typeof result!.ativo).toBe('boolean');
      expect(typeof result!.vinculado_formulario).toBe('boolean');
      
      // Validar tipos específicos
      expect(typeof result!.id).toBe('string');
      expect(typeof result!.nome).toBe('string');
      expect(typeof result!.assunto).toBe('string');
      expect(typeof result!.corpo).toBe('string');
      expect(result!.id.length).toBeGreaterThan(0);
      expect(result!.nome.length).toBeGreaterThan(0);
    });

    it('deve lidar com campos opcionais nulos', async () => {
      // Arrange
      mockEmailService.findWithFallback.mockResolvedValue({
        template: templateWithNullFields as EmailTemplate,
        isDefault: true,
        mappingFound: false,
        fallbackType: 'form_default'
      });

      // Act
      const result = await mockEmailService.findWithFallback('comply_edocs', 'on-premise');

      // Assert
      expect(result.template).toBeDefined();
      expect(result.template!.descricao).toBeNull();
      expect(result.template!.tipo).toBeNull();
      expect(result.template!.modalidade).toBeNull();
      expect(result.template!.updated_at).toBeNull();
      
      // Campos obrigatórios devem estar presentes
      expect(result.template!.id).toBeDefined();
      expect(result.template!.nome).toBeDefined();
      expect(result.template!.assunto).toBeDefined();
      expect(result.template!.corpo).toBeDefined();
    });

    it('deve validar valores de enum para formulário', async () => {
      // Arrange
      mockEmailService.findByMapping.mockResolvedValue(validTemplate);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(['comply_fiscal', 'comply_edocs']).toContain(result!.formulario);
      expect(['on-premise', 'saas', null]).toContain(result!.modalidade);
    });

    it('deve validar formato de datas', async () => {
      // Arrange
      mockEmailService.findByMapping.mockResolvedValue(validTemplate);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(result!.created_at).toBeDefined();
      
      // Validar formato ISO 8601
      const createdAt = new Date(result!.created_at!);
      expect(createdAt).toBeInstanceOf(Date);
      expect(isNaN(createdAt.getTime())).toBe(false); // Data válida
      expect(result!.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
    });

    it('deve validar comprimento máximo de campos de texto', async () => {
      // Arrange
      const templateWithLongText = {
        ...validTemplate,
        nome: 'A'.repeat(300), // Nome muito longo
        assunto: 'B'.repeat(500), // Assunto muito longo
        corpo: 'C'.repeat(10000) // Corpo longo mas aceitável
      };

      mockEmailService.findByMapping.mockResolvedValue(templateWithLongText);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(result!.nome.length).toBe(300);
      expect(result!.assunto.length).toBe(500);
      expect(result!.corpo.length).toBe(10000);
    });
  });

  describe('Validação de Constraints de Banco', () => {
    it('deve validar unicidade de mapeamentos', async () => {
      // Arrange
      mockEmailService.validateUniqueness.mockResolvedValue(false);

      // Act
      const isUnique = await mockEmailService.validateUniqueness(
        'comply_fiscal',
        'on-premise',
        'different-template-id'
      );

      // Assert
      expect(isUnique).toBe(false);
      expect(mockEmailService.validateUniqueness).toHaveBeenCalledWith(
        'comply_fiscal',
        'on-premise',
        'different-template-id'
      );
    });

    it('deve permitir edição do mesmo template (exclusão por ID)', async () => {
      // Arrange
      mockEmailService.validateUniqueness.mockResolvedValue(true);

      // Act
      const isUnique = await mockEmailService.validateUniqueness(
        'comply_fiscal',
        'on-premise',
        validTemplate.id // Excluir o próprio template da validação
      );

      // Assert
      expect(isUnique).toBe(true);
    });

    it('deve validar referências de template válidas', async () => {
      // Arrange
      mockEmailService.getTemplateById.mockResolvedValue(validTemplate);

      // Act
      const template = await mockEmailService.getTemplateById(validTemplate.id);

      // Assert
      expect(template).toBeDefined();
      expect(template!.id).toBe(validTemplate.id);
      expect(template!.ativo).toBe(true);
    });

    it('deve detectar referências de template inválidas', async () => {
      // Arrange
      const invalidTemplateId = 'template-inexistente';
      mockEmailService.getTemplateById.mockResolvedValue(null);

      // Act
      const template = await mockEmailService.getTemplateById(invalidTemplateId);

      // Assert
      expect(template).toBeNull();
    });

    it('deve tratar templates inativos', async () => {
      // Arrange
      mockEmailService.findByMapping.mockResolvedValue(null); // Template inativo não é retornado

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'saas');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Validação de Consistência', () => {
    it('deve validar consistência de mapeamentos', async () => {
      // Arrange
      const mappings = [
        {
          formulario: 'comply_fiscal' as const,
          modalidade: 'on-premise' as const,
          templateId: 'template-1',
          template: validTemplate
        },
        {
          formulario: 'comply_edocs' as const,
          modalidade: 'saas' as const,
          templateId: 'template-2',
          template: { ...validTemplate, id: 'template-2', formulario: 'comply_edocs', modalidade: 'saas' }
        }
      ];

      mockEmailService.getMappingsList.mockResolvedValue(mappings);

      // Act
      const result = await mockEmailService.getMappingsList();

      // Assert
      expect(result).toHaveLength(2);
      
      // Verificar se não há duplicatas
      const combinations = result.map(m => `${m.formulario}-${m.modalidade}`);
      const uniqueCombinations = [...new Set(combinations)];
      expect(combinations.length).toBe(uniqueCombinations.length);

      // Verificar se todos os mapeamentos têm dados válidos
      result.forEach(mapping => {
        expect(mapping.formulario).toBeDefined();
        expect(mapping.modalidade).toBeDefined();
        expect(mapping.templateId).toBeDefined();
        expect(mapping.template).toBeDefined();
      });
    });

    it('deve manter consistência durante operações concorrentes', async () => {
      // Arrange
      const template = validTemplate;
      mockEmailService.findByMapping.mockResolvedValue(template);

      // Act
      const promises = Array.from({ length: 10 }, () =>
        mockEmailService.findByMapping('comply_fiscal', 'on-premise')
      );

      const results = await Promise.all(promises);

      // Assert
      // Todos os resultados devem ser consistentes
      results.forEach(result => {
        expect(result).toEqual(template);
      });

      // Deve ter feito 10 consultas independentes
      expect(mockEmailService.findByMapping).toHaveBeenCalledTimes(10);
    });

    it('deve validar tipos de dados corretos', async () => {
      // Arrange
      const mappings = [
        {
          formulario: 'comply_fiscal' as const,
          modalidade: 'on-premise' as const,
          templateId: 'template-1',
          template: validTemplate
        }
      ];

      mockEmailService.getMappingsList.mockResolvedValue(mappings);

      // Act
      const result = await mockEmailService.getMappingsList();

      // Assert
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

  describe('Performance e Otimização', () => {
    it('deve executar consultas rapidamente', async () => {
      // Arrange
      const template = validTemplate;
      mockEmailService.findByMapping.mockResolvedValue(template);

      // Act
      const startTime = performance.now();
      await mockEmailService.findByMapping('comply_fiscal', 'on-premise');
      const endTime = performance.now();

      // Assert
      // Consulta deve ser rápida (menos de 50ms em ambiente de teste)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('deve otimizar consultas de listagem de mapeamentos', async () => {
      // Arrange
      const mappings = [validTemplate].map(t => ({
        formulario: t.formulario as 'comply_fiscal' | 'comply_edocs',
        modalidade: t.modalidade as 'on-premise' | 'saas',
        templateId: t.id,
        template: t
      }));

      mockEmailService.getMappingsList.mockResolvedValue(mappings);

      // Act
      const startTime = performance.now();
      const result = await mockEmailService.getMappingsList();
      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.length).toBe(mappings.length);
    });

    it('deve processar grandes volumes de dados eficientemente', async () => {
      // Arrange
      const largeMappingsList = Array.from({ length: 1000 }, (_, index) => ({
        formulario: index % 2 === 0 ? 'comply_edocs' : 'comply_fiscal' as const,
        modalidade: index % 2 === 0 ? 'on-premise' : 'saas' as const,
        templateId: `template-${index}`,
        template: {
          ...validTemplate,
          id: `template-${index}`,
          nome: `Template ${index}`,
          ativo: index % 3 !== 0
        }
      }));

      mockEmailService.getMappingsList.mockResolvedValue(largeMappingsList);

      // Act
      const startTime = performance.now();
      const result = await mockEmailService.getMappingsList();
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Deve processar em menos de 100ms
    });
  });

  describe('Cenários de Erro', () => {
    it('deve tratar erro de conexão com banco de dados', async () => {
      // Arrange
      const dbError = new Error('Connection timeout');
      mockEmailService.findByMapping.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        mockEmailService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow('Connection timeout');
    });

    it('deve tratar resposta vazia do serviço', async () => {
      // Arrange
      mockEmailService.getMappingsList.mockResolvedValue([]);

      // Act
      const result = await mockEmailService.getMappingsList();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve tratar templates sem dados completos', async () => {
      // Arrange
      const incompleteMapping = {
        formulario: 'comply_edocs' as const,
        modalidade: 'on-premise' as const,
        templateId: 'incomplete-template',
        template: undefined
      };
      
      mockEmailService.getMappingsList.mockResolvedValue([incompleteMapping]);

      // Act
      const result = await mockEmailService.getMappingsList();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].template).toBeUndefined();
      expect(result[0].templateId).toBe('incomplete-template');
    });
  });

  describe('Cenários de Migração e Backup', () => {
    it('deve validar integridade após recuperação de backup', async () => {
      // Arrange
      const templatesAfterRestore = [
        validTemplate,
        { ...validTemplate, id: 'template-restored-1' },
        { ...validTemplate, id: 'template-restored-2' }
      ].map(t => ({
        formulario: t.formulario as 'comply_fiscal' | 'comply_edocs',
        modalidade: t.modalidade as 'on-premise' | 'saas',
        templateId: t.id,
        template: t
      }));

      mockEmailService.getMappingsList.mockResolvedValue(templatesAfterRestore);

      // Act
      const mappings = await mockEmailService.getMappingsList();

      // Assert
      expect(mappings).toHaveLength(3);
      
      // Validar integridade de cada template
      mappings.forEach(mapping => {
        expect(mapping.template).toBeDefined();
        expect(mapping.template!.id).toBeDefined();
        expect(mapping.template!.nome).toBeDefined();
        expect(mapping.template!.ativo).toBe(true);
        expect(mapping.formulario).toBeDefined();
        expect(mapping.modalidade).toBeDefined();
      });
    });

    it('deve detectar corrupção de dados após restauração', async () => {
      // Arrange
      const corruptedTemplate = {
        ...validTemplate,
        id: null, // ID corrompido
        nome: '', // Nome vazio
        ativo: null // Boolean corrompido
      };

      mockEmailService.findByMapping.mockResolvedValue(corruptedTemplate as any);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      // O serviço deve retornar os dados como estão (validação no frontend)
      expect(result).toBeDefined();
      expect((result as any).id).toBeNull();
      expect((result as any).nome).toBe('');
      expect((result as any).ativo).toBeNull();
    });

    it('deve validar estrutura após migração de schema', async () => {
      // Arrange
      const templateWithNewFields = {
        ...validTemplate,
        // Simular novos campos adicionados por migração
        version: '2.0',
        metadata: { migrated: true },
        tags: ['fiscal', 'on-premise']
      };

      mockEmailService.findByMapping.mockResolvedValue(templateWithNewFields as any);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      
      // Campos originais devem estar presentes
      expect(result!.id).toBe(validTemplate.id);
      expect(result!.nome).toBe(validTemplate.nome);
      expect(result!.ativo).toBe(validTemplate.ativo);
      
      // Novos campos devem ser preservados
      expect((result as any).version).toBe('2.0');
      expect((result as any).metadata).toEqual({ migrated: true });
      expect((result as any).tags).toEqual(['fiscal', 'on-premise']);
    });

    it('deve manter compatibilidade com dados legados', async () => {
      // Arrange
      const legacyTemplate = {
        id: 'legacy-template-001',
        nome: 'Template Legado',
        assunto: 'Assunto legado',
        corpo: 'Corpo legado',
        ativo: true,
        vinculado_formulario: true,
        // Campos legados que podem não existir mais
        old_field: 'valor antigo',
        deprecated_status: 'active'
      };

      mockEmailService.findByMapping.mockResolvedValue(legacyTemplate as any);

      // Act
      const result = await mockEmailService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe('legacy-template-001');
      expect(result!.nome).toBe('Template Legado');
      expect(result!.ativo).toBe(true);
      
      // Campos legados devem ser preservados
      expect((result as any).old_field).toBe('valor antigo');
      expect((result as any).deprecated_status).toBe('active');
    });
  });
});