import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmailTemplateMapping, FormContextProviderComponent } from '@/hooks/useEmailTemplateMapping';
import type { EmailTemplate } from '@/types/approval';

// Componente que usa o hook dentro do contexto
const TemplateSearchComponent: React.FC = () => {
  const {
    loading,
    findTemplateFromContext,
    findTemplateFromContextWithFallback,
    getCurrentContext,
    getFormularioLabel,
    getModalidadeLabel
  } = useEmailTemplateMapping();

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [fallbackResult, setFallbackResult] = useState<any>(null);

  const context = getCurrentContext();

  const handleFindTemplate = async () => {
    const result = await findTemplateFromContext();
    setTemplate(result);
  };

  const handleFindWithFallback = async () => {
    const result = await findTemplateFromContextWithFallback();
    setFallbackResult(result);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Busca de Template por Contexto</CardTitle>
        <CardDescription>
          Demonstração do hook useEmailTemplateMapping com identificação automática
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contexto atual */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Contexto Atual:</h3>
          <div className="flex gap-2">
            <Badge variant="outline">
              {context.formulario ? getFormularioLabel(context.formulario) : 'Não definido'}
            </Badge>
            <Badge variant="outline">
              {context.modalidade ? getModalidadeLabel(context.modalidade) : 'Não definido'}
            </Badge>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button 
            onClick={handleFindTemplate} 
            disabled={loading || !context.formulario || !context.modalidade}
          >
            {loading ? 'Buscando...' : 'Buscar Template Específico'}
          </Button>
          <Button 
            variant="outline"
            onClick={handleFindWithFallback} 
            disabled={loading || !context.formulario || !context.modalidade}
          >
            {loading ? 'Buscando...' : 'Buscar com Fallback'}
          </Button>
        </div>

        {/* Resultado da busca específica */}
        {template && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Template Encontrado:</h3>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {template.nome}</p>
              <p><strong>Assunto:</strong> {template.assunto}</p>
              <p><strong>Formulário:</strong> {template.formulario}</p>
              <p><strong>Modalidade:</strong> {template.modalidade}</p>
            </div>
          </div>
        )}

        {/* Resultado da busca com fallback */}
        {fallbackResult && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Resultado com Fallback:</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge variant={fallbackResult.mappingFound ? "default" : "secondary"}>
                  {fallbackResult.mappingFound ? 'Mapeamento Encontrado' : 'Sem Mapeamento'}
                </Badge>
                <Badge variant={fallbackResult.isDefault ? "outline" : "default"}>
                  {fallbackResult.isDefault ? 'Template Padrão' : 'Template Específico'}
                </Badge>
              </div>
              {fallbackResult.template && (
                <div className="mt-2">
                  <p><strong>Nome:</strong> {fallbackResult.template.nome}</p>
                  <p><strong>Assunto:</strong> {fallbackResult.template.assunto}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente principal com diferentes contextos
const EmailTemplateMappingExample: React.FC = () => {
  const [currentContext, setCurrentContext] = useState<{
    formulario: 'comply_edocs' | 'comply_fiscal';
    modalidade: 'on-premise' | 'saas';
  }>({
    formulario: 'comply_fiscal',
    modalidade: 'on-premise'
  });

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Exemplo: Hook de Mapeamento de Templates</h1>
        <p className="text-gray-600">
          Demonstração da funcionalidade de identificação automática de contexto
        </p>
      </div>

      {/* Seletor de contexto */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurar Contexto</CardTitle>
          <CardDescription>
            Altere o contexto para testar diferentes combinações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Formulário:</label>
              <div className="space-y-2">
                <Button
                  variant={currentContext.formulario === 'comply_fiscal' ? 'default' : 'outline'}
                  onClick={() => setCurrentContext(prev => ({ ...prev, formulario: 'comply_fiscal' }))}
                  className="w-full"
                >
                  Comply Fiscal
                </Button>
                <Button
                  variant={currentContext.formulario === 'comply_edocs' ? 'default' : 'outline'}
                  onClick={() => setCurrentContext(prev => ({ ...prev, formulario: 'comply_edocs' }))}
                  className="w-full"
                >
                  Comply e-DOCS
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Modalidade:</label>
              <div className="space-y-2">
                <Button
                  variant={currentContext.modalidade === 'on-premise' ? 'default' : 'outline'}
                  onClick={() => setCurrentContext(prev => ({ ...prev, modalidade: 'on-premise' }))}
                  className="w-full"
                >
                  On-premise
                </Button>
                <Button
                  variant={currentContext.modalidade === 'saas' ? 'default' : 'outline'}
                  onClick={() => setCurrentContext(prev => ({ ...prev, modalidade: 'saas' }))}
                  className="w-full"
                >
                  SaaS
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente com contexto */}
      <div className="flex justify-center">
        <FormContextProviderComponent 
          formulario={currentContext.formulario} 
          modalidade={currentContext.modalidade}
        >
          <TemplateSearchComponent />
        </FormContextProviderComponent>
      </div>

      {/* Documentação */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Envolver componente com FormContextProvider:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<FormContextProviderComponent formulario="comply_fiscal" modalidade="on-premise">
  <SeuComponente />
</FormContextProviderComponent>`}
            </pre>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">2. Usar o hook dentro do componente:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const { 
  findTemplateFromContext,
  findTemplateFromContextWithFallback,
  getCurrentContext 
} = useEmailTemplateMapping();

// Buscar template usando contexto automaticamente
const template = await findTemplateFromContext();

// Buscar com fallback usando contexto
const result = await findTemplateFromContextWithFallback();`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Funcionalidades disponíveis:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>findTemplateFromContext():</strong> Busca template específico usando contexto atual</li>
              <li><strong>findTemplateFromContextWithFallback():</strong> Busca com sistema de fallback</li>
              <li><strong>getCurrentContext():</strong> Retorna formulário e modalidade do contexto</li>
              <li><strong>invalidateCache():</strong> Limpa cache quando templates são modificados</li>
              <li><strong>Cache automático:</strong> Evita consultas repetidas durante a sessão (5 min)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateMappingExample;