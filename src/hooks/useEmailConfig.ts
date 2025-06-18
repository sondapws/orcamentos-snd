
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailConfig {
  id: string;
  servidor: string;
  porta: number;
  usuario: string;
  senha: string;
  ssl: boolean;
}

interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
}

export const useEmailConfig = () => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmailConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configuração de e-mail:', error);
        return;
      }

      if (data) {
        setEmailConfig(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    }
  };

  const fetchEmailTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('nome', 'template_orcamento')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar template de e-mail:', error);
        return;
      }

      if (data) {
        setEmailTemplate(data);
      }
    } catch (error) {
      console.error('Erro ao buscar template:', error);
    }
  };

  const saveEmailConfig = async (config: Omit<EmailConfig, 'id'>) => {
    try {
      if (emailConfig?.id) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('email_config')
          .update({
            servidor: config.servidor,
            porta: config.porta,
            usuario: config.usuario,
            senha: config.senha,
            ssl: config.ssl,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailConfig.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('email_config')
          .insert([config])
          .select()
          .single();

        if (error) throw error;
        setEmailConfig(data);
      }

      await fetchEmailConfig();
      
      toast({
        title: "Configurações SMTP salvas",
        description: "As configurações de e-mail foram atualizadas com sucesso.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar as configurações SMTP.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const saveEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'nome'>) => {
    try {
      if (emailTemplate?.id) {
        // Atualizar template existente
        const { error } = await supabase
          .from('email_templates')
          .update({
            assunto: template.assunto,
            corpo: template.corpo,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailTemplate.id);

        if (error) throw error;
      } else {
        // Criar novo template
        const { data, error } = await supabase
          .from('email_templates')
          .insert([{ ...template, nome: 'template_orcamento' }])
          .select()
          .single();

        if (error) throw error;
        setEmailTemplate(data);
      }

      await fetchEmailTemplate();
      
      toast({
        title: "Template salvo",
        description: "O template de e-mail foi atualizado com sucesso.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro ao salvar template",
        description: "Ocorreu um erro ao salvar o template de e-mail.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEmailConfig(), fetchEmailTemplate()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    emailConfig,
    emailTemplate,
    loading,
    saveEmailConfig,
    saveEmailTemplate,
    refreshData: () => Promise.all([fetchEmailConfig(), fetchEmailTemplate()])
  };
};
