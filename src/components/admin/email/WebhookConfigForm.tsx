import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebhookConfig {
  id?: string;
  webhook_url: string;
  ativo: boolean;
}

const WebhookConfigForm = () => {
  const [config, setConfig] = useState<WebhookConfig>({
    webhook_url: 'https://prod-15.westus.logic.azure.com:443/workflows/6dcbd557c39b4d74afe41a7f223caf2e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cyD7xWu4TpxXXsSWcH9h8BU5NptbrLkqPVCh0WrXasU',
    ativo: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configuração:', error);
        return;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      if (config.id) {
        const { error } = await supabase
          .from('webhook_config')
          .update({
            webhook_url: config.webhook_url,
            ativo: config.ativo
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('webhook_config')
          .insert([{
            webhook_url: config.webhook_url,
            ativo: config.ativo
          }])
          .select()
          .single();

        if (error) throw error;
        setConfig(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Configuração salva",
        description: "As configurações do webhook foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async () => {
    setTesting(true);
    try {
      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          nome: 'Teste do Sistema',
          email: 'teste@sistema.com',
          mensagem: 'Este é um teste do webhook do Power Automate.'
        }),
      });

      toast({
        title: "Teste enviado",
        description: "O teste foi enviado para o webhook. Verifique se o e-mail foi recebido.",
      });
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "Erro no teste",
        description: "Ocorreu um erro ao testar o webhook.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Webhook Power Automate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook_url">URL do Webhook</Label>
          <Input
            id="webhook_url"
            value={config.webhook_url}
            onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
            placeholder="https://prod-15.westus.logic.azure.com:443/workflows/..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={config.ativo}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ativo: checked }))}
          />
          <Label htmlFor="ativo">Webhook ativo</Label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={saveConfig} disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Configuração
          </Button>
          <Button 
            variant="outline" 
            onClick={testWebhook} 
            disabled={testing || !config.webhook_url}
            className="flex-1"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Testar Webhook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookConfigForm;