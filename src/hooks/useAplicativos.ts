
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Aplicativo {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useAplicativos = () => {
  const [aplicativos, setAplicativos] = useState<Aplicativo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAplicativos = async () => {
    try {
      const { data, error } = await supabase
        .from('aplicativos')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar aplicativos:', error);
        return;
      }

      setAplicativos(data || []);
    } catch (error) {
      console.error('Erro ao buscar aplicativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAplicativo = async (aplicativo: Omit<Aplicativo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('aplicativos')
        .insert([aplicativo])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar aplicativo:', error);
        return { error };
      }

      await fetchAplicativos(); // Recarregar lista
      return { data };
    } catch (error) {
      console.error('Erro ao criar aplicativo:', error);
      return { error };
    }
  };

  const updateAplicativo = async (id: string, updates: Partial<Omit<Aplicativo, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('aplicativos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar aplicativo:', error);
        return { error };
      }

      await fetchAplicativos(); // Recarregar lista
      return { data };
    } catch (error) {
      console.error('Erro ao atualizar aplicativo:', error);
      return { error };
    }
  };

  const deleteAplicativo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('aplicativos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar aplicativo:', error);
        return { error };
      }

      await fetchAplicativos(); // Recarregar lista
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar aplicativo:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchAplicativos();
  }, []);

  return {
    aplicativos,
    loading,
    createAplicativo,
    updateAplicativo,
    deleteAplicativo,
    refreshAplicativos: fetchAplicativos
  };
};
