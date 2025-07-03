import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfigSuporte } from './useRegrasPrecificacao';

export const useConfigSuporte = (regraId?: string) => {
  const [configs, setConfigs] = useState<ConfigSuporte[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    if (!regraId) {
      setConfigs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('config_suporte')
        .select('*')
        .eq('regra_id', regraId)
        .order('ano');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações de suporte:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar configurações de suporte",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarConfig = async (dados: Omit<ConfigSuporte, 'id' | 'total'>) => {
    try {
      const total = dados.quantidade_horas * dados.preco_unitario;
      
      const { data, error } = await supabase
        .from('config_suporte')
        .insert({ ...dados, total })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração de suporte criada com sucesso",
      });

      await fetchConfigs();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar configuração:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar configuração",
      });
      throw error;
    }
  };

  const atualizarConfig = async (id: string, dados: Partial<ConfigSuporte>) => {
    try {
      // Recalcular total se quantidade_horas ou preco_unitario foram alterados
      let dadosAtualizados = { ...dados };
      if (dados.quantidade_horas !== undefined || dados.preco_unitario !== undefined) {
        const configAtual = configs.find(c => c.id === id);
        if (configAtual) {
          const quantidade = dados.quantidade_horas ?? configAtual.quantidade_horas;
          const preco = dados.preco_unitario ?? configAtual.preco_unitario;
          dadosAtualizados.total = quantidade * preco;
        }
      }

      const { error } = await supabase
        .from('config_suporte')
        .update(dadosAtualizados)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });

      await fetchConfigs();
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao atualizar configuração",
      });
    }
  };

  const excluirConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('config_suporte')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração excluída com sucesso",
      });

      await fetchConfigs();
    } catch (error: any) {
      console.error('Erro ao excluir configuração:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao excluir configuração",
      });
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [regraId]);

  return {
    configs,
    loading,
    criarConfig,
    atualizarConfig,
    excluirConfig,
    fetchConfigs
  };
};