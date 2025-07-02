
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';
import TestEmailDialog from '../TestEmailDialog';
import EmailEditor from './EmailEditor';
import EmailPreview from './EmailPreview';
import TemplateVariables from './TemplateVariables';

interface EmailTemplate {
  assunto: string;
  corpo: string;
}

interface EmailTemplateFormProps {
  emailTemplate: any;
  onSave: (template: Omit<EmailTemplate, 'id' | 'nome'>) => Promise<{ success: boolean; error?: any }>;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({ emailTemplate, onSave }) => {
  const [templateData, setTemplateData] = useState<EmailTemplate>({
    assunto: 'Seu Orçamento - {{razaoSocial}}',
    corpo: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
    .content { margin: 20px 0; }
    .details { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .variable { color: #059669; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Orçamento - <span class="variable">{{razaoSocial}}</span></h2>
  </div>
  
  <div class="content">
    <p>Prezado(a) <span class="variable">{{responsavel}}</span>,</p>
    
    <p>Segue em anexo o orçamento solicitado para <span class="variable">{{razaoSocial}}</span>.</p>
    
    <div class="details">
      <h3>Detalhes do orçamento:</h3>
      <ul>
        <li><strong>Empresa:</strong> <span class="variable">{{razaoSocial}}</span></li>
        <li><strong>CNPJ:</strong> <span class="variable">{{cnpj}}</span></li>
        <li><strong>Segmento:</strong> <span class="variable">{{segmento}}</span></li>
        <li><strong>Modalidade:</strong> <span class="variable">{{modalidade}}</span></li>
        <li><strong>Valor:</strong> <span class="variable">{{valor}}</span></li>
      </ul>
    </div>
    
    <p>Atenciosamente,<br>
    <strong>Equipe Comercial</strong></p>
  </div>
</body>
</html>`
  });

  useEffect(() => {
    if (emailTemplate) {
      setTemplateData({
        assunto: emailTemplate.assunto,
        corpo: emailTemplate.corpo,
      });
    }
  }, [emailTemplate]);

  const handleSave = async () => {
    await onSave(templateData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template de E-mail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="editor" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Editor HTML
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor">
            <EmailEditor 
              template={templateData}
              onTemplateChange={setTemplateData}
            />
          </TabsContent>

          <TabsContent value="preview">
            <EmailPreview template={templateData} />
          </TabsContent>
        </Tabs>

        <TemplateVariables />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSave} className="flex-1">
            Salvar Template
          </Button>
          <div className="flex-1">
            <TestEmailDialog emailTemplate={templateData} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplateForm;
