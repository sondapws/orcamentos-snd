
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import SmtpConfigForm from '@/components/admin/email/SmtpConfigForm';
import EmailTemplateForm from '@/components/admin/email/EmailTemplateForm';
import { useEmailConfig } from '@/hooks/useEmailConfig';

const EmailConfig = () => {
  const {
    emailConfig,
    emailTemplate,
    loading,
    saveEmailConfig,
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
          <p className="text-gray-600">Configure o SMTP e templates de e-mail</p>
        </div>

        <Tabs defaultValue="smtp" className="space-y-4">
          <TabsList>
            <TabsTrigger value="smtp">Configurações SMTP</TabsTrigger>
            <TabsTrigger value="template">Template de E-mail</TabsTrigger>
          </TabsList>

          <TabsContent value="smtp">
            <SmtpConfigForm 
              emailConfig={emailConfig}
              onSave={saveEmailConfig}
            />
          </TabsContent>

          <TabsContent value="template">
            <EmailTemplateForm 
              emailTemplate={emailTemplate}
              onSave={saveEmailTemplate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EmailConfig;
