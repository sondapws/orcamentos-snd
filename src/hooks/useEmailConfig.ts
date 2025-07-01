
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
}

export const useEmailConfig = () => {
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      await fetchEmailTemplate();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    emailTemplate,
    loading,
    saveEmailTemplate,
    refreshData: fetchEmailTemplate
  };
};
