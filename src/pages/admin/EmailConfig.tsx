
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import EmailTemplateForm from '@/components/admin/email/EmailTemplateForm';
import EmailLogsViewer from '@/components/admin/email/EmailLogsViewer';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const EmailConfig = () => {
  const {
    emailTemplate,
    loading,
    saveEmailTemplate,
  } = useEmailConfig();

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
          <p className="text-gray-600">Configure templates via Power Automate e monitore os envios</p>
        </div>

        <Tabs defaultValue="config" className="space-y-4">
          <TabsList>
            <TabsTrigger value="config">Configuração de Envio</TabsTrigger>
            <TabsTrigger value="template">Template de E-mail</TabsTrigger>
            <TabsTrigger value="logs">Logs de Envio</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Configuração de Envio via Power Automate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    O sistema está configurado para enviar e-mails através do Microsoft Power Automate. 
                    Não são necessárias configurações SMTP adicionais.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Informações do Sistema:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Método de Envio:</strong> Microsoft Power Automate</li>
                    <li>• <strong>Status:</strong> Ativo e Configurado</li>
                    <li>• <strong>Confiabilidade:</strong> Alta (gerenciado pela Microsoft)</li>
                    <li>• <strong>Configuração:</strong> Não requer configuração SMTP</li>
                  </ul>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Vantagens do Power Automate:</strong>
                    <br />
                    ✓ Maior confiabilidade de entrega
                    <br />
                    ✓ Sem necessidade de configurar servidores SMTP
                    <br />
                    ✓ Gerenciamento automático pela Microsoft
                    <br />
                    ✓ Melhor performance e simplicidade
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template">
            <EmailTemplateForm 
              emailTemplate={emailTemplate}
              onSave={saveEmailTemplate}
            />
          </TabsContent>

          <TabsContent value="logs">
            <EmailLogsViewer />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EmailConfig;
