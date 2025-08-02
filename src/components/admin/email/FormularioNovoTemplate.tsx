import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useTemplateMappingValidation } from '@/hooks/useTemplateMappingValidation';
import EmailEditor from './EditorEmail';
import EmailPreview from './PreviewEmail';
import TemplateVariables from './VariaveisTemplate';
import TestEmailDialog from '../DialogTesteEmail';
import TemplateMappingValidation from './TemplateMappingValidation';

interface FormularioNovoTemplateProps {
  onSuccess: () => void;
}

const FormularioNovoTemplate: React.FC<FormularioNovoTemplateProps> = ({ onSuccess }) => {
  const { createTemplate } = useEmailTemplates();
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Hook para validação de mapeamento
  const {
    validationState,
    isValidating,
    validateMapping,
    hasError: hasValidationError
  } = useTemplateMappingValidation({
    showToasts: false, // Não mostrar toasts, usar validação inline
    autoValidate: false // Validar manualmente antes de submeter
  });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    formulario: '' as 'comply_edocs' | 'comply_fiscal' | '',
    modalidade: 'todas',
    assunto: 'Orçamento Comply - {{razaoSocial}}',
    corpo: `<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background: linear-gradient(135deg, #2563eb, #1d4ed8); 
      color: white; 
      padding: 30px; 
      text-align: center; 
      border-radius: 8px 8px 0 0; 
    }
    .content { 
      background: #f8fafc; 
      padding: 30px; 
      border-radius: 0 0 8px 8px; 
    }
    .details { 
      background: white; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 20px 0; 
      border-left: 4px solid #2563eb; 
    }
    .variable { 
      color: #059669; 
      font-weight: bold; 
    }
    .footer {
      background: #374151;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      border-radius: 8px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Orçamento Aprovado</h1>
    <p>Comply - Soluções Fiscais</p>
  </div>
  
  <div class="content">
    <p>Olá <strong class="variable">{{responsavel}}</strong>,</p>
    
    <p>Seu orçamento foi aprovado e processado com sucesso! Segue abaixo os dados da sua solicitação:</p>
    
    <div class="details">
      <h3 style="color: #2563eb; margin-top: 0;">Dados da Solicitação</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong> <span class="variable">{{razaoSocial}}</span></li>
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>CNPJ:</strong> <span class="variable">{{cnpj}}</span></li>
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Responsável:</strong> <span class="variable">{{responsavel}}</span></li>
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>E-mail:</strong> <span class="variable">{{email}}</span></li>
        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Segmento:</strong> <span class="variable">{{segmento}}</span></li>
        <li style="padding: 8px 0;"><strong>Modalidade:</strong> <span class="variable">{{modalidade}}</span></li>
      </ul>
    </div>
    
    <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0; color: #1e40af; font-weight: 500;">
        📧 Em breve nossa equipe comercial entrará em contato para apresentar sua proposta personalizada.
      </p>
    </div>
    
    <p>Atenciosamente,<br>
    <strong>Equipe Sonda</strong></p>
  </div>
  
  <div class="footer">
    <p style="margin: 0;">© 2024 Sonda - Soluções em Tecnologia</p>
  </div>
</body>
</html>`
  });

  const modalidadeOptions = {
    comply_edocs: [
      { value: 'saas', label: 'SaaS' },
      { value: 'on-premise', label: 'On-Premise' },
      { value: 'hibrido', label: 'Híbrido' }
    ],
    comply_fiscal: [
      { value: 'saas', label: 'SaaS' },
      { value: 'on-premise', label: 'On-Premise' },
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validação básica dos campos obrigatórios
    if (!formData.nome.trim() || !formData.formulario || !formData.assunto.trim() || !formData.corpo.trim()) {
      console.log('Validação básica falhou:', {
        nome: formData.nome,
        formulario: formData.formulario,
        assunto: formData.assunto,
        corpo: formData.corpo.length
      });
      setValidationError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    // Validação de mapeamento único (apenas se modalidade específica foi selecionada)
    if (formData.modalidade !== 'todas' && formData.modalidade) {
      const validModalidades = ['on-premise', 'saas'];
      if (validModalidades.includes(formData.modalidade)) {
        console.log('Validando unicidade do mapeamento...');
        
        const mappingValidation = await validateMapping({
          formulario: formData.formulario,
          modalidade: formData.modalidade as 'on-premise' | 'saas'
        });

        if (!mappingValidation.isValid) {
          console.log('Validação de mapeamento falhou:', mappingValidation.error);
          setValidationError(mappingValidation.error || 'Erro de validação de mapeamento');
          return;
        }
      }
    }

    setLoading(true);

    try {
      const result = await createTemplate({
        nome: formData.nome,
        descricao: formData.descricao || null,
        formulario: formData.formulario,
        modalidade: formData.modalidade === 'todas' ? null : formData.modalidade || null,
        assunto: formData.assunto,
        corpo: formData.corpo,
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true
      });

      if (result.success) {
        console.log('Template criado com sucesso');
        onSuccess();
      } else {
        console.error('Erro ao criar template:', result.error);
        setValidationError('Erro ao criar template. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro inesperado ao criar template:', error);
      setValidationError('Erro inesperado ao criar template');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (newTemplate: { assunto: string; corpo: string }) => {
    console.log('Template sendo alterado (novo):', newTemplate);
    setFormData(prev => {
      const updated = {
        ...prev,
        assunto: newTemplate.assunto,
        corpo: newTemplate.corpo
      };
      console.log('FormData atualizado (novo):', updated);
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Template *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Template Comply e-DOCS SaaS"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formulario">Formulário *</Label>
              <Select
                value={formData.formulario}
                onValueChange={(value: 'comply_edocs' | 'comply_fiscal') =>
                  setFormData(prev => ({ ...prev, formulario: value, modalidade: 'todas' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formulário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comply_edocs">Comply e-DOCS</SelectItem>
                  <SelectItem value="comply_fiscal">Comply Fiscal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade</Label>
              <Select
                value={formData.modalidade}
                onValueChange={(value) => setFormData(prev => ({ ...prev, modalidade: value }))}
                disabled={!formData.formulario}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as modalidades</SelectItem>
                  {formData.formulario && modalidadeOptions[formData.formulario]?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Validação de mapeamento em tempo real */}
              {formData.formulario && formData.modalidade && formData.modalidade !== 'todas' && (
                <TemplateMappingValidation
                  formulario={formData.formulario}
                  modalidade={formData.modalidade}
                  realTimeValidation={true}
                  showToasts={false}
                  onValidationChange={(isValid, error) => {
                    if (!isValid && error) {
                      setValidationError(error);
                    } else if (isValid && validationError) {
                      // Limpar erro apenas se for erro de validação de mapeamento
                      if (validationError.includes('template para') || validationError.includes('mapeamento')) {
                        setValidationError(null);
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição opcional do template"
              rows={2}
            />
          </div>

          {/* Exibir erro de validação */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do E-mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4" />
                  Editor HTML
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview">
              <EmailPreview template={formData} />
            </TabsContent>

            <TabsContent value="editor">
              <EmailEditor
                template={formData}
                onTemplateChange={handleTemplateChange}
              />
              <TemplateVariables />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <TestEmailDialog emailTemplate={formData} />
        <Button 
          type="submit" 
          disabled={loading || isValidating || (hasValidationError && formData.modalidade !== 'todas')} 
          className="flex-1 sm:flex-initial"
        >
          {loading ? 'Criando...' : isValidating ? 'Validando...' : 'Criar Template'}
        </Button>
      </div>
    </form>
  );
};

export default FormularioNovoTemplate;