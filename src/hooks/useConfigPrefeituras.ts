import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfigPrefeitura } from './useRegrasPrecificacao';

export const useConfigPrefeituras = (regraId?: string) => {
  const [configs, setConfigs] = useState<ConfigPrefeitura[]>([]);
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
        .from('config_prefeituras')
        .select('*')
        .eq('regra_id', regraId)
        .order('quantidade_municipios');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações de prefeituras:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar configurações de prefeituras",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarConfig = async (dados: Omit<ConfigPrefeitura, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('config_prefeituras')
        .insert(dados)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração de prefeitura criada com sucesso",
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

  const atualizarConfig = async (id: string, dados: Partial<ConfigPrefeitura>) => {
    try {
      const { error } = await supabase
        .from('config_prefeituras')
        .update(dados)
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
        .from('config_prefeituras')
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