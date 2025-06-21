
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DadoProdutoAno {
  id: string;
  aplicativo_id: string;
  ano: number;
  calibracao_lu: number;
  lu_meses: number;
  lu_ma_minima: number;
  margem_venda: number;
  custo_percent?: number;
  receita_mensal?: number;
  custo_mensal?: number;
  receita_custo?: number;
  qtd_clientes?: number;
  custo_medio?: number;
  custo_base?: number;
  bloco_k_lu?: number;
  reinf_lu?: number;
  bloco_k_ma?: number;
  reinf_ma?: number;
  created_at: string;
  updated_at: string;
}

export const useDadosProdutoAno = (aplicativoId?: string) => {
  const [dados, setDados] = useState<DadoProdutoAno[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDados = async () => {
    try {
      let query = supabase
        .from('dados_produto_ano')
        .select('*')
        .order('ano', { ascending: false });

      if (aplicativoId) {
        query = query.eq('aplicativo_id', aplicativoId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados do produto:', error);
        return;
      }

      setDados(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados do produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDado = async (dado: Omit<DadoProdutoAno, 'id' | 'created_at' | 'updated_at' | 'custo_percent'>) => {
    try {
      const { data, error } = await supabase
        .from('dados_produto_ano')
        .insert([dado])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar dado do produto:', error);
        return { error };
      }

      await fetchDados();
      return { data };
    } catch (error) {
      console.error('Erro ao criar dado do produto:', error);
      return { error };
    }
  };

  const updateDado = async (id: string, updates: Partial<Omit<DadoProdutoAno, 'id' | 'created_at' | 'custo_percent'>>) => {
    try {
      const { data, error } = await supabase
        .from('dados_produto_ano')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar dado do produto:', error);
        return { error };
      }

      await fetchDados();
      return { data };
    } catch (error) {
      console.error('Erro ao atualizar dado do produto:', error);
      return { error };
    }
  };

  const deleteDado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dados_produto_ano')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar dado do produto:', error);
        return { error };
      }

      await fetchDados();
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar dado do produto:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchDados();
  }, [aplicativoId]);

  return {
    dados,
    loading,
    createDado,
    updateDado,
    deleteDado,
    refreshDados: fetchDados
  };
};
