import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfigSaas } from './useRegrasPrecificacao';

const PLANOS_PADRAO: Omit<ConfigSaas, 'id' | 'regra_id'>[] = [
  {
    plano: 'PP',
    nome_plano: 'Standard 7',
    volumetria_min: 0,
    volumetria_max: 7000,
    hosting: 0,
    devops: 0,
    setup: 0
  },
  {
    plano: 'P',
    nome_plano: 'Standard 20',
    volumetria_min: 7001,
    volumetria_max: 20000,
    hosting: 0,
    devops: 0,
    setup: 0
  },
  {
    plano: 'M',
    nome_plano: 'Standard 50',
    volumetria_min: 20001,
    volumetria_max: 50000,
    hosting: 0,
    devops: 0,
    setup: 0
  },
  {
    plano: 'MDB',
    nome_plano: 'Standard 70',
    volumetria_min: 50001,
    volumetria_max: 70000,
    hosting: 0,
    devops: 0,
    setup: 0
  },
  {
    plano: 'G',
    nome_plano: 'Plus 70',
    volumetria_min: 70001,
    volumetria_max: undefined,
    hosting: 0,
    devops: 0,
    setup: 0
  },
  {
    plano: 'GG',
    nome_plano: 'Plus 70 Consumo',
    volumetria_min: 70001,
    volumetria_max: undefined,
    hosting: 0,
    devops: 0,
    setup: 0
  }
];

export const useConfigSaas = (regraId?: string) => {
  const [configs, setConfigs] = useState<ConfigSaas[]>([]);
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
        .from('config_saas')
        .select('*')
        .eq('regra_id', regraId)
        .order('volumetria_min');

      if (error) throw error;
      
      // Se não há configurações, criar as padrões
      if (!data || data.length === 0) {
        await criarConfigsPadrao();
      } else {
        setConfigs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações SaaS:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar configurações SaaS",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarConfigsPadrao = async () => {
    if (!regraId) return;

    try {
      const configsComRegra = PLANOS_PADRAO.map(plano => ({
        ...plano,
        regra_id: regraId
      }));

      const { data, error } = await supabase
        .from('config_saas')
        .insert(configsComRegra)
        .select();

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao criar configurações padrão:', error);
    }
  };

  const atualizarConfig = async (id: string, dados: Partial<ConfigSaas>) => {
    try {
      const { error } = await supabase
        .from('config_saas')
        .update(dados)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração SaaS atualizada com sucesso",
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

  useEffect(() => {
    fetchConfigs();
  }, [regraId]);

  return {
    configs,
    loading,
    atualizarConfig,
    fetchConfigs
  };
};