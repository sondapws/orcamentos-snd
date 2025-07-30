import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EmailTemplate } from '@/types/approval';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('vinculado_formulario', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar templates de e-mail:', error);
        // Não retornar aqui, continuar com array vazio
        setTemplates([]);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      setTemplates([]);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          ...template,
          vinculado_formulario: true,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Template criado",
        description: "O template de e-mail foi criado com sucesso.",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({
        title: "Erro ao criar template",
        description: "Ocorreu um erro ao criar o template de e-mail.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateTemplate = async (id: string, template: Partial<EmailTemplate>) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          ...template,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Template atualizado",
        description: "O template de e-mail foi atualizado com sucesso.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      toast({
        title: "Erro ao atualizar template",
        description: "Ocorreu um erro ao atualizar o template de e-mail.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Template excluído",
        description: "O template de e-mail foi excluído com sucesso.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        title: "Erro ao excluir template",
        description: "Ocorreu um erro ao excluir o template de e-mail.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const toggleTemplateStatus = async (id: string, ativo: boolean) => {
    return updateTemplate(id, { ativo });
  };

  const getTemplateByFormAndModality = async (
    formulario: 'comply_edocs' | 'comply_fiscal', 
    modalidade?: string
  ): Promise<EmailTemplate | null> => {
    try {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('vinculado_formulario', true)
        .eq('ativo', true)
        .eq('formulario', formulario);

      if (modalidade) {
        query = query.eq('modalidade', modalidade);
      } else {
        query = query.is('modalidade', null);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar template específico:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar template por formulário e modalidade:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTemplates();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateStatus,
    getTemplateByFormAndModality,
    refreshTemplates: fetchTemplates
  };
};