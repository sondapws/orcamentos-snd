import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EmailTemplate } from '@/types/approval';

// Função helper para extrair informações do nome do template
const parseTemplateName = (nome: string) => {
  const parts = nome.split(' - ');
  if (parts.length >= 2) {
    const nomeBase = parts[0];
    const formulario = parts[1];
    const modalidade = parts[2] || null;
    
    return {
      nomeBase,
      formulario: formulario as 'comply_edocs' | 'comply_fiscal',
      modalidade
    };
  }
  
  return {
    nomeBase: nome,
    formulario: null,
    modalidade: null
  };
};

// Função helper para mapear dados do Supabase para EmailTemplate
const mapSupabaseToEmailTemplate = (data: any): EmailTemplate => {
  const parsed = parseTemplateName(data.nome);
  
  return {
    id: data.id,
    nome: parsed.nomeBase,
    assunto: data.assunto,
    corpo: data.corpo,
    descricao: data.descricao,
    tipo: data.tipo,
    ativo: data.ativo,
    vinculado_formulario: data.vinculado_formulario,
    formulario: parsed.formulario,
    modalidade: parsed.modalidade,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

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

      const mappedTemplates = (data || []).map(mapSupabaseToEmailTemplate);
      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      setTemplates([]);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Criando template com dados:', template);
      
      // Criar nome único que inclui formulário e modalidade
      const nomeCompleto = `${template.nome} - ${template.formulario}${template.modalidade && template.modalidade !== 'todas' ? ` - ${template.modalidade}` : ''}`;
      
      const templateData = {
        nome: nomeCompleto,
        assunto: template.assunto,
        corpo: template.corpo,
        descricao: template.descricao,
        tipo: template.tipo || 'orcamento',
        ativo: true,
        vinculado_formulario: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Dados que serão inseridos:', templateData);

      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Template criado com sucesso:', data);
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
      console.log('Atualizando template ID:', id, 'com dados:', template);
      
      // Criar nome completo se formulário foi alterado
      let nomeCompleto = template.nome;
      if (template.formulario) {
        nomeCompleto = `${template.nome} - ${template.formulario}${template.modalidade && template.modalidade !== 'todas' ? ` - ${template.modalidade}` : ''}`;
      }
      
      const updateData = {
        nome: nomeCompleto,
        assunto: template.assunto,
        corpo: template.corpo,
        descricao: template.descricao,
        tipo: template.tipo,
        ativo: template.ativo,
        updated_at: new Date().toISOString()
      };

      console.log('Dados de atualização:', updateData);

      const { error } = await supabase
        .from('email_templates')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro do Supabase na atualização:', error);
        throw error;
      }

      console.log('Template atualizado com sucesso');
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
      // Buscar templates que contenham o formulário no nome
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('vinculado_formulario', true)
        .eq('ativo', true)
        .ilike('nome', `%${formulario}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar template específico:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Filtrar pelo template mais específico
      const mappedTemplates = data.map(mapSupabaseToEmailTemplate);
      
      // Primeiro, tentar encontrar um template específico para a modalidade
      if (modalidade) {
        const specificTemplate = mappedTemplates.find(t => 
          t.formulario === formulario && t.modalidade === modalidade
        );
        if (specificTemplate) {
          return specificTemplate;
        }
      }

      // Se não encontrar específico, buscar template geral para o formulário
      const generalTemplate = mappedTemplates.find(t => 
        t.formulario === formulario && !t.modalidade
      );
      
      return generalTemplate || mappedTemplates[0];
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