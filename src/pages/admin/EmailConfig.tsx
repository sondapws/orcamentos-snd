
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import TestEmailDialog from '@/components/admin/TestEmailDialog';
import { useEmailConfig } from '@/hooks/useEmailConfig';

const EmailConfig = () => {
  const {
    emailConfig,
    emailTemplate,
    loading,
    saveEmailConfig,
    saveEmailTemplate,
  } = useEmailConfig();

  const [smtpConfig, setSmtpConfig] = useState({
    servidor: 'smtp.office365.com',
    porta: 587,
    usuario: '',
    senha: '',
    ssl: true
  });

  const [templateData, setTemplateData] = useState({
    assunto: 'Seu Orçamento - {{razaoSocial}}',
    corpo: `Prezado(a) {{responsavel}},

Segue em anexo o orçamento solicitado para {{razaoSocial}}.

Detalhes do orçamento:
- Empresa: {{razaoSocial}}
- CNPJ: {{cnpj}}
- Segmento: {{segmento}}
- Modalidade: {{modalidade}}
- Valor: {{valor}}

Atenciosamente,
Equipe Comercial`
  });

  // Atualizar estados quando os dados forem carregados
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

  useEffect(() => {
    if (emailTemplate) {
      setTemplateData({
        assunto: emailTemplate.assunto,
        corpo: emailTemplate.corpo,
      });
    }
  }, [emailTemplate]);

  const handleSaveSmtp = async () => {
    await saveEmailConfig(smtpConfig);
  };

  const handleSaveTemplate = async () => {
    await saveEmailTemplate(templateData);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuração de E-mails</h1>
          <p className="text-gray-600">Configure o SMTP e templates de e-mail</p>
        </div>

        <Tabs defaultValue="smtp" className="space-y-4">
          <TabsList>
            <TabsTrigger value="smtp">Configurações SMTP</TabsTrigger>
            <TabsTrigger value="template">Template de E-mail</TabsTrigger>
          </TabsList>

          <TabsContent value="smtp">
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
                <Button onClick={handleSaveSmtp}>Salvar Configurações SMTP</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template">
            <Card>
              <CardHeader>
                <CardTitle>Template de E-mail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto do E-mail</Label>
                  <Input
                    id="assunto"
                    value={templateData.assunto}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, assunto: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corpo">Corpo do E-mail</Label>
                  <Textarea
                    id="corpo"
                    rows={15}
                    value={templateData.corpo}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, corpo: e.target.value }))}
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Variáveis Disponíveis:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <span className="bg-white px-2 py-1 rounded">{'{{razaoSocial}}'}</span>
                    <span className="bg-white px-2 py-1 rounded">{'{{responsavel}}'}</span>
                    <span className="bg-white px-2 py-1 rounded">{'{{cnpj}}'}</span>
                    <span className="bg-white px-2 py-1 rounded">{'{{segmento}}'}</span>
                    <span className="bg-white px-2 py-1 rounded">{'{{modalidade}}'}</span>
                    <span className="bg-white px-2 py-1 rounded">{'{{valor}}'}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSaveTemplate} className="flex-1">
                    Salvar Template
                  </Button>
                  <div className="flex-1">
                    <TestEmailDialog emailTemplate={templateData} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EmailConfig;
