
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/LayoutAdmin';
import EmailTemplateForm from '@/components/admin/email/FormularioTemplateEmail';
import EmailTemplateManager from '@/components/admin/email/GerenciadorTemplatesEmail';
import EmailLogsViewer from '@/components/admin/email/VisualizadorLogsEmail';
import WebhookConfigForm from '@/components/admin/email/FormularioConfiguracaoWebhook';
import { useEmailConfig } from '@/hooks/useEmailConfig';

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
          <p className="text-gray-600">Configure templates e webhook do Power Automate</p>
        </div>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates por Formulário</TabsTrigger>
            <TabsTrigger value="template">Template Geral</TabsTrigger>
            <TabsTrigger value="config">Configuração do Webhook</TabsTrigger>
            <TabsTrigger value="logs">Logs de Envio</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="template">
            <EmailTemplateForm 
              emailTemplate={emailTemplate}
              onSave={saveEmailTemplate}
            />
          </TabsContent>

          <TabsContent value="config">
            <WebhookConfigForm />
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
