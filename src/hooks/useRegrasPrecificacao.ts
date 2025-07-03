import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RegraPrecificacao {
  id?: string;
  ano: number;
  aplicativo_id: string;
  calibracao_lu: number;
  lu_meses: number;
  lu_ma_minima: number;
  margem_venda: number;
  receita_mensal: number;
  custo_mensal: number;
  qtd_clientes: number;
  bloco_k_lu: number;
  reinf_lu: number;
  bloco_k_ma: number;
  reinf_ma: number;
  custo_percent?: number;
  receita_custo_percent?: number;
  custo_medio?: number;
  custo_base?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ConfigPrefeitura {
  id?: string;
  regra_id: string;
  quantidade_municipios: number;
  calibracao?: number;
  sob_consulta: boolean;
}

export interface ConfigSaas {
  id?: string;
  regra_id: string;
  plano: string;
  nome_plano: string;
  volumetria_min: number;
  volumetria_max?: number;
  hosting: number;
  devops: number;
  setup: number;
}

export interface ConfigSuporte {
  id?: string;
  regra_id: string;
  ano: number;
  tipo_suporte: string;
  quantidade_horas: number;
  preco_unitario: number;
  total: number;
}

export interface ConfigVA {
  id?: string;
  regra_id: string;
  fator: number;
  va: number;
  agregado: number;
  calibracao: number;
}

export const useRegrasPrecificacao = () => {
  const [regras, setRegras] = useState<RegraPrecificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRegras = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('regras_precificacao')
        .select(`
          *,
          aplicativos(nome)
        `)
        .order('ano', { ascending: false });

      if (error) throw error;
      setRegras(data || []);
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar regras de precificação",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularCampos = (dados: Partial<RegraPrecificacao>): Partial<RegraPrecificacao> => {
    const { margem_venda, custo_mensal, receita_mensal, qtd_clientes } = dados;
    
    const custo_percent = margem_venda ? 100 - margem_venda : 0;
    
    const receita_custo_percent = (custo_mensal && receita_mensal && receita_mensal > 0) 
      ? (custo_mensal / receita_mensal) * 100 
      : 0;
    
    const custo_medio = (custo_mensal && qtd_clientes && qtd_clientes > 0) 
      ? custo_mensal / qtd_clientes 
      : 0;
    
    const custo_base = custo_medio * (receita_custo_percent / 100);

    return {
      ...dados,
      custo_percent,
      receita_custo_percent,
      custo_medio,
      custo_base
    };
  };

  const criarRegra = async (dados: Omit<RegraPrecificacao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Processar campos que precisam ser divididos por 12
      const dadosProcessados = {
        ...dados,
        bloco_k_ma: dados.bloco_k_ma / 12,
        reinf_ma: dados.reinf_ma / 12
      };

      // Calcular campos automáticos
      const dadosCompletos = calcularCampos(dadosProcessados);

      const { data, error } = await supabase
        .from('regras_precificacao')
        .insert(dadosCompletos as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Regra de precificação criada com sucesso",
      });

      await fetchRegras();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar regra:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar regra de precificação",
      });
      throw error;
    }
  };

  const atualizarRegra = async (id: string, dados: Partial<RegraPrecificacao>) => {
    try {
      const dadosCompletos = calcularCampos(dados);
      
      const { error } = await supabase
        .from('regras_precificacao')
        .update(dadosCompletos)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Regra atualizada com sucesso",
      });

      await fetchRegras();
    } catch (error: any) {
      console.error('Erro ao atualizar regra:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao atualizar regra",
      });
    }
  };

  const excluirRegra = async (id: string) => {
    try {
      const { error } = await supabase
        .from('regras_precificacao')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Regra excluída com sucesso",
      });

      await fetchRegras();
    } catch (error: any) {
      console.error('Erro ao excluir regra:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao excluir regra",
      });
    }
  };

  useEffect(() => {
    fetchRegras();
  }, []);

  return {
    regras,
    loading,
    criarRegra,
    atualizarRegra,
    excluirRegra,
    fetchRegras,
    calcularCampos
  };
};