
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailLog {
  id: string;
  destinatario: string;
  assunto: string;
  status: string;
  erro?: string;
  enviado_em: string;
  created_at: string;
}

export const useEmailLogs = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('enviado_em', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao buscar logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    refreshLogs: fetchLogs
  };
};
