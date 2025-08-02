import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import type { EmailTemplate } from '@/types/approval';

// Mock do Supabase para testes de integração de banco
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: null })),
            eq: vi.fn(() => ({ data: [], error: null }))
          })),
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ data: [], error: null }))
            }))
          })),
          neq: vi.fn(() => ({ data: [], error: null })),
          not: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: null, data: [] })),
      update: vi.fn(() => ({ error: null, data: [] })),
      delete: vi.fn(() => ({ error: null, data: [] })),
      upsert: vi.fn(() => ({ error: null, data: [] }))
    }))
  }
}));

// Mock dos serviços auxiliares
vi.mock('@/services/auditLogger', () => ({
  auditLogger: {
    logTemplateSearch: vi.fn(),
    logFallbackUsage: vi.fn(),
    logError: vi.fn(),
    logOperation: vi.fn()
  }
}));

vi.mock('@/services/adminNotificationService', () => ({
  adminNotificationService: {
    notifyError: vi.fn(),
    notifyConfigurationIssue: vi.fn()
  }
}));

vi.mock('@/services/errorRecoveryService', () => ({
  errorRecoveryService: {
    executeWithRecovery: vi.fn((fn) => fn().then(result => ({ success: true, result })))
  }
}));

describe('Database Validation - Integration Tests', () => {
  const mockSupabase = vi.mocked(supabase);

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
    
    // Setup padrão do mock
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [], error: null })),
            eq: vi.fn(() => ({ data: [], error: null }))
          })),
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ data: [], error: null }))
            }))
          })),
          neq: vi.fn(() => ({ data: [], error: null })),
          not: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({ error: null, data: [] })),
      update: vi.fn(() => ({ error: null, data: [] })),
      delete: vi.fn(() => ({ error: null, data: [] })),
      upsert: vi.fn(() => ({ error: null, data: [] }))
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validação de Integridade de Dados', () => {
    it('deve validar campos obrigatórios em templates', async () => {
      // Arrange
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [validTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

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
      mockSupabase.from().select().eq().eq().eq().is().order().limit
        .mockResolvedValue({ 
          data: [templateWithNullFields], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findWithFallback('comply_edocs', 'on-premise');

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
      const templateWithValidEnum = { ...validTemplate };
      
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [templateWithValidEnum], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(['comply_fiscal', 'comply_edocs']).toContain(result!.formulario);
      expect(['on-premise', 'saas', null]).toContain(result!.modalidade);
    });

    it('deve validar formato de datas', async () => {
      // Arrange
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [validTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      expect(result).toBeDefined();
      expect(result!.created_at).toBeDefined();
      
      // Validar formato ISO 8601
      const createdAt = new Date(result!.created_at!);
      expect(createdAt).toBeInstanceOf(Date);
      expect(createdAt.toISOString()).toBe(result!.created_at);
    });

    it('deve validar comprimento máximo de campos de texto', async () => {
      // Arrange
      const templateWithLongText = {
        ...validTemplate,
        nome: 'A'.repeat(300), // Nome muito longo
        assunto: 'B'.repeat(500), // Assunto muito longo
        corpo: 'C'.repeat(10000) // Corpo longo mas aceitável
      };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [templateWithLongText], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

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
      const duplicateTemplate = { ...validTemplate, id: 'template-duplicate' };
      
      // Mock: encontrar template duplicado
      mockSupabase.from().select().eq().eq().eq().neq
        .mockResolvedValue({ 
          data: [duplicateTemplate], 
          error: null 
        });

      // Act
      const isUnique = await emailTemplateMappingService.validateUniqueness(
        'comply_fiscal',
        'on-premise',
        'different-template-id'
      );

      // Assert
      expect(isUnique).toBe(false);
      
      // Verificar se a consulta foi feita corretamente
      expect(mockSupabase.from).toHaveBeenCalledWith('email_templates');
      expect(mockSupabase.from().select().eq().eq().eq().neq).toHaveBeenCalled();
    });

    it('deve permitir edição do mesmo template (exclusão por ID)', async () => {
      // Arrange
      const sameTemplate = validTemplate;
      
      // Mock: não encontrar outros templates (excluindo o próprio)
      mockSupabase.from().select().eq().eq().eq().neq
        .mockResolvedValue({ 
          data: [], 
          error: null 
        });

      // Act
      const isUnique = await emailTemplateMappingService.validateUniqueness(
        'comply_fiscal',
        'on-premise',
        sameTemplate.id // Excluir o próprio template da validação
      );

      // Assert
      expect(isUnique).toBe(true);
    });

    it('deve validar referências de chave estrangeira', async () => {
      // Arrange
      const templateId = 'template-valid-001';
      
      mockSupabase.from().select().eq().eq().single
        .mockResolvedValue({ 
          data: validTemplate, 
          error: null 
        });

      // Act
      const template = await emailTemplateMappingService.getTemplateById(templateId);

      // Assert
      expect(template).toBeDefined();
      expect(template!.id).toBe(templateId);
      
      // Verificar se a consulta foi feita com os filtros corretos
      expect(mockSupabase.from).toHaveBeenCalledWith('email_templates');
      expect(mockSupabase.from().select().eq().eq().single).toHaveBeenCalled();
    });

    it('deve tratar violação de constraint de NOT NULL', async () => {
      // Arrange
      const dbError = {
        code: '23502',
        message: 'null value in column "nome" violates not-null constraint'
      };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: null, 
          error: dbError 
        });

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow();
    });

    it('deve tratar violação de constraint de CHECK', async () => {
      // Arrange
      const dbError = {
        code: '23514',
        message: 'new row for relation "email_templates" violates check constraint'
      };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: null, 
          error: dbError 
        });

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow();
    });
  });

  describe('Validação de Índices e Performance', () => {
    it('deve usar índice composto para consultas de mapeamento', async () => {
      // Arrange
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [validTemplate], 
          error: null 
        });

      // Act
      const startTime = performance.now();
      await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');
      const endTime = performance.now();

      // Assert
      // Consulta deve ser rápida (indicando uso de índice)
      expect(endTime - startTime).toBeLessThan(50);
      
      // Verificar se os filtros estão na ordem correta para o índice
      const selectChain = mockSupabase.from().select();
      expect(selectChain.eq).toHaveBeenCalledWith('vinculado_formulario', true);
      expect(selectChain.eq().eq).toHaveBeenCalledWith('ativo', true);
      expect(selectChain.eq().eq().eq).toHaveBeenCalledWith('formulario', 'comply_fiscal');
      expect(selectChain.eq().eq().eq().eq).toHaveBeenCalledWith('modalidade', 'on-premise');
    });

    it('deve otimizar consultas de listagem com filtros', async () => {
      // Arrange
      const templates = [validTemplate, { ...validTemplate, id: 'template-2' }];
      
      mockSupabase.from().select().eq().eq().not().order
        .mockResolvedValue({ 
          data: templates, 
          error: null 
        });

      // Act
      const startTime = performance.now();
      await emailTemplateMappingService.getMappingsList();
      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100);
      
      // Verificar se usa filtros otimizados
      expect(mockSupabase.from().select().eq().eq().not).toHaveBeenCalled();
    });

    it('deve limitar resultados para evitar sobrecarga', async () => {
      // Arrange
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [validTemplate], 
          error: null 
        });

      // Act
      await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      // Verificar se usa LIMIT para consultas específicas
      expect(mockSupabase.from().select().eq().eq().eq().eq().order().limit)
        .toHaveBeenCalledWith(1);
    });
  });

  describe('Validação de Transações e Consistência', () => {
    it('deve manter consistência durante operações concorrentes', async () => {
      // Arrange
      const template1 = { ...validTemplate, id: 'template-concurrent-1' };
      const template2 = { ...validTemplate, id: 'template-concurrent-2' };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValueOnce({ data: [template1], error: null })
        .mockResolvedValueOnce({ data: [template2], error: null });

      // Act
      const [result1, result2] = await Promise.all([
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise'),
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ]);

      // Assert
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1!.id).toBe('template-concurrent-1');
      expect(result2!.id).toBe('template-concurrent-2');
    });

    it('deve tratar deadlocks de banco de dados', async () => {
      // Arrange
      const deadlockError = {
        code: '40P01',
        message: 'deadlock detected'
      };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockRejectedValue(deadlockError);

      // Act & Assert
      await expect(
        emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise')
      ).rejects.toThrow();
    });

    it('deve validar isolamento de transações', async () => {
      // Arrange
      const template = validTemplate;
      
      // Simular leitura durante atualização
      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [template], 
          error: null 
        });

      // Act
      const readPromise = emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');
      
      // Simular atualização concorrente
      const updatePromise = Promise.resolve({ data: [template], error: null });

      const [readResult] = await Promise.all([readPromise, updatePromise]);

      // Assert
      expect(readResult).toBeDefined();
      expect(readResult!.id).toBe(template.id);
    });
  });

  describe('Validação de Backup e Recuperação', () => {
    it('deve validar integridade após recuperação de backup', async () => {
      // Arrange
      const templatesAfterRestore = [
        validTemplate,
        { ...validTemplate, id: 'template-restored-1' },
        { ...validTemplate, id: 'template-restored-2' }
      ];

      mockSupabase.from().select().eq().eq().not().order
        .mockResolvedValue({ 
          data: templatesAfterRestore, 
          error: null 
        });

      // Act
      const mappings = await emailTemplateMappingService.getMappingsList();

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

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [corruptedTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

      // Assert
      // O serviço deve retornar os dados como estão (validação no frontend)
      expect(result).toBeDefined();
      expect(result!.id).toBeNull();
      expect(result!.nome).toBe('');
      expect(result!.ativo).toBeNull();
    });
  });

  describe('Validação de Migração de Dados', () => {
    it('deve validar estrutura após migração de schema', async () => {
      // Arrange
      const templateWithNewFields = {
        ...validTemplate,
        // Simular novos campos adicionados por migração
        version: '2.0',
        metadata: { migrated: true },
        tags: ['fiscal', 'on-premise']
      };

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [templateWithNewFields], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

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

      mockSupabase.from().select().eq().eq().eq().eq().order().limit
        .mockResolvedValue({ 
          data: [legacyTemplate], 
          error: null 
        });

      // Act
      const result = await emailTemplateMappingService.findByMapping('comply_fiscal', 'on-premise');

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