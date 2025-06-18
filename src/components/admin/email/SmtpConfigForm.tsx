
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
    servidor: 'smtp.office365.com',
    porta: 587,
    usuario: '',
    senha: '',
    ssl: true
  });

  useEffect(() => {
    if (emailConfig) {
      setSmtpConfig({
        servidor: emailConfig.servidor,
        porta: emailConfig.porta,
        usuario: emailConfig.usuario,
        senha: emailConfig.senha,
        ssl: emailConfig.ssl,
      });
    }
  }, [emailConfig]);

  const handleSave = async () => {
    await onSave(smtpConfig);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Servidor SMTP</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="servidor">Servidor SMTP</Label>
            <Input
              id="servidor"
              value={smtpConfig.servidor}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, servidor: e.target.value }))}
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
              placeholder="seu-email@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={smtpConfig.senha}
              onChange={(e) => setSmtpConfig(prev => ({ ...prev, senha: e.target.value }))}
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
        <Button onClick={handleSave}>Salvar Configurações SMTP</Button>
      </CardContent>
    </Card>
  );
};

export default SmtpConfigForm;
