import React, { useState, useEffect } from 'react';
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
import type { EmailTemplate } from '@/types/approval';

interface EditorTemplateCompletoProps {
  template: EmailTemplate;
  onSuccess: () => void;
}

const EditorTemplateCompleto: React.FC<EditorTemplateCompletoProps> = ({ 
  template, 
  onSuccess 
}) => {
  const { updateTemplate } = useEmailTemplates();
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
    nome: template.nome,
    descricao: template.descricao || '',
    formulario: template.formulario || '' as 'comply_edocs' | 'comply_fiscal' | '',
    modalidade: template.modalidade || 'todas',
    assunto: template.assunto,
    corpo: template.corpo
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

  useEffect(() => {
    console.log('Template changed in editor:', template);
    setFormData({
      nome: template.nome,
      descricao: template.descricao || '',
      formulario: template.formulario || '',
      modalidade: template.modalidade || 'todas',
      assunto: template.assunto,
      corpo: template.corpo
    });
  }, [template.id, template.nome, template.assunto, template.corpo, template.descricao, template.formulario, template.modalidade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validação básica dos campos obrigatórios
    if (!formData.nome.trim() || !formData.formulario || !formData.assunto.trim() || !formData.corpo.trim()) {
      console.log('Validação básica falhou na edição:', { 
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
        console.log('Validando unicidade do mapeamento na edição...');
        
        const mappingValidation = await validateMapping({
          formulario: formData.formulario,
          modalidade: formData.modalidade as 'on-premise' | 'saas',
          excludeId: template.id // Excluir o template atual da validação
        });

        if (!mappingValidation.isValid) {
          console.log('Validação de mapeamento falhou na edição:', mappingValidation.error);
          setValidationError(mappingValidation.error || 'Erro de validação de mapeamento');
          return;
        }
      }
    }

    setLoading(true);
    
    try {
      const result = await updateTemplate(template.id, {
        nome: formData.nome,
        descricao: formData.descricao || null,
        formulario: formData.formulario,
        modalidade: formData.modalidade === 'todas' ? null : formData.modalidade || null,
        assunto: formData.assunto,
        corpo: formData.corpo
      });

      if (result.success) {
        console.log('Template atualizado com sucesso');
        onSuccess();
      } else {
        console.error('Erro ao atualizar template:', result.error);
        setValidationError('Erro ao atualizar template. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro inesperado ao atualizar template:', error);
      setValidationError('Erro inesperado ao atualizar template');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (newTemplate: { assunto: string; corpo: string }) => {
    console.log('Template sendo alterado no editor:', newTemplate);
    setFormData(prev => {
      const updated = {
        ...prev,
        assunto: newTemplate.assunto,
        corpo: newTemplate.corpo
      };
      console.log('FormData atualizado no editor:', updated);
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
                  excludeId={template.id}
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
          {loading ? 'Salvando...' : isValidating ? 'Validando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default EditorTemplateCompleto;