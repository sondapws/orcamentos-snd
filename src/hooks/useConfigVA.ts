import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfigVA } from './useRegrasPrecificacao';

export const useConfigVA = (regraId?: string) => {
  const [configs, setConfigs] = useState<ConfigVA[]>([]);
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
        .from('config_va')
        .select('*')
        .eq('regra_id', regraId)
        .order('fator');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações VA:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar configurações VA",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarConfig = async (dados: Omit<ConfigVA, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('config_va')
        .insert(dados)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração VA criada com sucesso",
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

  const atualizarConfig = async (id: string, dados: Partial<ConfigVA>) => {
    try {
      const { error } = await supabase
        .from('config_va')
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
        .from('config_va')
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

  const calcularVA = (matrizes: number, ufs: number): { fator: number; va: number; agregado: number; calibracao: number } => {
    const fator = matrizes * 1.3 + ufs * 1.7;
    
    // Encontrar a configuração mais próxima
    const configOrdenada = [...configs].sort((a, b) => Math.abs(a.fator - fator) - Math.abs(b.fator - fator));
    const configMaisProxima = configOrdenada[0];
    
    if (configMaisProxima) {
      return {
        fator,
        va: configMaisProxima.va,
        agregado: configMaisProxima.agregado,
        calibracao: configMaisProxima.calibracao
      };
    }
    
    return { fator, va: 0, agregado: 0, calibracao: 0 };
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
    fetchConfigs,
    calcularVA
  };
};