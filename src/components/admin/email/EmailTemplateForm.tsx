
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';
import TestEmailDialog from '../TestEmailDialog';

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

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (emailTemplate) {
      setTemplateData({
        assunto: emailTemplate.assunto,
        corpo: emailTemplate.corpo,
      });
    }
  }, [emailTemplate]);

  // Função para renderizar preview com dados de exemplo
  const renderPreview = () => {
    const dadosExemplo = {
      razaoSocial: 'Empresa de Teste Ltda',
      responsavel: 'João da Silva',
      cnpj: '12.345.678/0001-90',
      segmento: 'Indústria',
      modalidade: 'SaaS',
      valor: 'R$ 5.000,00'
    };

    let assuntoComDados = templateData.assunto;
    let corpoComDados = templateData.corpo;

    Object.entries(dadosExemplo).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      assuntoComDados = assuntoComDados.replace(regex, value);
      corpoComDados = corpoComDados.replace(regex, value);
    });

    return { assuntoComDados, corpoComDados };
  };

  const handleSave = async () => {
    await onSave(templateData);
  };

  return (
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

          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="corpo">Corpo do E-mail (HTML)</Label>
              <Textarea
                id="corpo"
                rows={20}
                value={templateData.corpo}
                onChange={(e) => setTemplateData(prev => ({ ...prev, corpo: e.target.value }))}
                className="font-mono text-sm"
                placeholder="Digite o HTML do seu e-mail aqui..."
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Assunto:</Label>
                <p className="font-semibold mt-1">{renderPreview().assuntoComDados}</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-white min-h-[400px]">
                <Label className="text-sm font-medium text-gray-600 mb-3 block">Preview do E-mail:</Label>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderPreview().corpoComDados 
                  }} 
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <strong>Dados de exemplo utilizados no preview:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Empresa: Empresa de Teste Ltda</li>
                  <li>• Responsável: João da Silva</li>
                  <li>• CNPJ: 12.345.678/0001-90</li>
                  <li>• Segmento: Indústria</li>
                  <li>• Modalidade: SaaS</li>
                  <li>• Valor: R$ 5.000,00</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
