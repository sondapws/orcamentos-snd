
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
