import { describe, it, expect, beforeEach } from 'vitest';
import { 
  EmailTemplateFallbackConfigManager, 
  defaultEmailTemplateFallbackConfig 
} from '@/config/emailTemplateConfig';

describe('EmailTemplateFallbackConfigManager', () => {
  let configManager: EmailTemplateFallbackConfigManager;

  beforeEach(() => {
    configManager = new EmailTemplateFallbackConfigManager();
  });

  describe('Configuração Inicial', () => {
    it('deve inicializar com configuração padrão', () => {
      const config = configManager.getConfig();
      
      expect(config).toEqual(defaultEmailTemplateFallbackConfig);
      expect(config.logging.enabled).toBe(true);
      expect(config.behavior.useAnyActiveTemplateAsFallback).toBe(true);
    });
  });

  describe('Templates Padrão', () => {
    it('deve definir e obter template padrão para formulário', () => {
      configManager.setDefaultTemplate('comply_fiscal', 'template-fiscal-default');
      
      expect(configManager.getDefaultTemplate('comply_fiscal')).toBe('template-fiscal-default');
      expect(configManager.getDefaultTemplate('comply_edocs')).toBeUndefined();
    });

    it('deve definir templates padrão para múltiplos formulários', () => {
      configManager.setDefaultTemplate('comply_fiscal', 'template-fiscal');
      configManager.setDefaultTemplate('comply_edocs', 'template-edocs');
      
      expect(configManager.getDefaultTemplate('comply_fiscal')).toBe('template-fiscal');
      expect(configManager.getDefaultTemplate('comply_edocs')).toBe('template-edocs');
    });
  });

  describe('Template Global de Fallback', () => {
    it('deve definir e obter template global de fallback', () => {
      configManager.setGlobalFallbackTemplate('global-template');
      
      expect(configManager.getGlobalFallbackTemplate()).toBe('global-template');
    });
  });

  describe('Configurações de Logging', () => {
    it('deve verificar se logging está habilitado', () => {
      expect(configManager.isLoggingEnabled()).toBe(true);
      
      configManager.updateConfig({
        logging: { enabled: false, logFallbackUsage: false, logMappingNotFound: false }
      });
      
      expect(configManager.isLoggingEnabled()).toBe(false);
    });

    it('deve verificar configurações específicas de logging', () => {
      configManager.updateConfig({
        logging: { enabled: true, logFallbackUsage: true, logMappingNotFound: false }
      });
      
      expect(configManager.shouldLogFallbackUsage()).toBe(true);
      expect(configManager.shouldLogMappingNotFound()).toBe(false);
    });
  });

  describe('Configurações de Comportamento', () => {
    it('deve verificar se deve usar qualquer template ativo como fallback', () => {
      expect(configManager.shouldUseAnyActiveTemplateAsFallback()).toBe(true);
      
      configManager.updateConfig({
        behavior: { useAnyActiveTemplateAsFallback: false, failWhenNoTemplateFound: false }
      });
      
      expect(configManager.shouldUseAnyActiveTemplateAsFallback()).toBe(false);
    });

    it('deve verificar se deve falhar quando não encontra template', () => {
      expect(configManager.shouldFailWhenNoTemplateFound()).toBe(false);
      
      configManager.updateConfig({
        behavior: { useAnyActiveTemplateAsFallback: true, failWhenNoTemplateFound: true }
      });
      
      expect(configManager.shouldFailWhenNoTemplateFound()).toBe(true);
    });
  });

  describe('Atualização de Configuração', () => {
    it('deve atualizar configuração parcialmente', () => {
      const initialConfig = configManager.getConfig();
      
      configManager.updateConfig({
        logging: { enabled: false, logFallbackUsage: false, logMappingNotFound: false }
      });
      
      const updatedConfig = configManager.getConfig();
      
      expect(updatedConfig.logging.enabled).toBe(false);
      expect(updatedConfig.behavior).toEqual(initialConfig.behavior); // Não deve ter mudado
    });

    it('deve manter templates existentes ao atualizar', () => {
      configManager.setDefaultTemplate('comply_fiscal', 'template-1');
      configManager.setDefaultTemplate('comply_edocs', 'template-2');
      
      configManager.updateConfig({
        defaultTemplates: { comply_fiscal: 'template-updated' }
      });
      
      expect(configManager.getDefaultTemplate('comply_fiscal')).toBe('template-updated');
      expect(configManager.getDefaultTemplate('comply_edocs')).toBe('template-2');
    });
  });
});