
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';

const EmailConfig = () => {
  const [smtpConfig, setSmtpConfig] = useState({
    servidor: 'smtp.office365.com',
    porta: '587',
    usuario: '',
    senha: '',
    ssl: true
  });

  const [emailTemplate, setEmailTemplate] = useState({
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

  const { toast } = useToast();

  const handleSaveSmtp = () => {
    // Aqui você salvaria as configurações SMTP
    toast({
      title: "Configurações SMTP salvas",
      description: "As configurações de e-mail foram atualizadas com sucesso.",
    });
  };

  const handleSaveTemplate = () => {
    // Aqui você salvaria o template
    toast({
      title: "Template salvo",
      description: "O template de e-mail foi atualizado com sucesso.",
    });
  };

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
                      value={smtpConfig.porta}
                      onChange={(e) => setSmtpConfig(prev => ({ ...prev, porta: e.target.value }))}
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
                    value={emailTemplate.assunto}
                    onChange={(e) => setEmailTemplate(prev => ({ ...prev, assunto: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corpo">Corpo do E-mail</Label>
                  <Textarea
                    id="corpo"
                    rows={15}
                    value={emailTemplate.corpo}
                    onChange={(e) => setEmailTemplate(prev => ({ ...prev, corpo: e.target.value }))}
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
                <Button onClick={handleSaveTemplate}>Salvar Template</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EmailConfig;
