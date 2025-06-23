
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface SmtpConfig {
  servidor: string;
  porta: number;
  usuario: string;
  senha: string;
  ssl: boolean;
}

interface SmtpConfigFormProps {
  emailConfig: any;
  onSave: (config: Omit<SmtpConfig, 'id'>) => Promise<{ success: boolean; error?: any }>;
}

const SmtpConfigForm: React.FC<SmtpConfigFormProps> = ({ emailConfig, onSave }) => {
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    servidor: '',
    porta: 587,
    usuario: '',
    senha: '',
    ssl: true
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (emailConfig) {
      setSmtpConfig({
        servidor: emailConfig.servidor || '',
        porta: emailConfig.porta || 587,
        usuario: emailConfig.usuario || '',
        senha: emailConfig.senha || '',
        ssl: emailConfig.ssl !== false,
      });
    }
  }, [emailConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(smtpConfig);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Configurações do Servidor SMTP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Sistema configurado para envio SMTP real. Configure seu servidor de e-mail abaixo para envio efetivo.
          </AlertDescription>
        </Alert>

        {emailConfig && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Configuração SMTP encontrada e carregada com sucesso.
            </AlertDescription>
          </Alert>
        )}

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> O sistema agora usa envio SMTP real. Certifique-se de que as configurações estão corretas para evitar falhas no envio.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="servidor">Servidor SMTP</Label>
            <Input
              id="servidor"
              value={smtpConfig.servidor}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, servidor: e.target.value }))}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="porta">Porta</Label>
            <Input
              id="porta"
              type="number"
              value={smtpConfig.porta}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, porta: parseInt(e.target.value) || 587 }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuário (E-mail)</Label>
            <Input
              id="usuario"
              type="email"
              value={smtpConfig.usuario}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, usuario: e.target.value }))}
              placeholder="seu-email@gmail.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha do App</Label>
            <Input
              id="senha"
              type="password"
              value={smtpConfig.senha}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, senha: e.target.value }))}
              placeholder="Senha específica do app"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="ssl"
              checked={smtpConfig.ssl}
              onCheckedChange={(checked) => setSmtpConfig(prev => ({ ...prev, ssl: checked }))}
            />
            <Label htmlFor="ssl">Usar SSL/TLS</Label>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Configurações Comuns:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Gmail:</strong> smtp.gmail.com:587 (SSL) - Use senha de app</p>
            <p><strong>Outlook:</strong> smtp.office365.com:587 (SSL)</p>
            <p><strong>Yahoo:</strong> smtp.mail.yahoo.com:587 (SSL)</p>
            <p><strong>Senda:</strong> smtp.senda.com.br:587 (SSL)</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-yellow-800">Dicas para Gmail:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>1. Ative a verificação em 2 etapas na sua conta Google</p>
            <p>2. Crie uma "Senha de app" específica para este sistema</p>
            <p>3. Use a senha de app no campo "Senha do App" acima</p>
            <p>4. Nunca use sua senha normal do Gmail</p>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configurações SMTP'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SmtpConfigForm;
