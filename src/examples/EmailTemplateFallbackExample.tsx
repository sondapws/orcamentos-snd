import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { emailTemplateMappingService } from '@/services/emailTemplateMappingService';
import { emailTemplateFallbackConfigManager } from '@/config/emailTemplateConfig';
import type { TemplateMappingResult } from '@/services/emailTemplateMappingService';

const EmailTemplateFallbackExample: React.FC = () => {
  const [formulario, setFormulario] = useState<'comply_fiscal' | 'comply_edocs'>('comply_fiscal');
  const [modalidade, setModalidade] = useState<'on-premise' | 'saas'>('on-premise');
  const [result, setResult] = useState<TemplateMappingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuração
  const [defaultTemplateId, setDefaultTemplateId] = useState('');
  const [globalFallbackId, setGlobalFallbackId] = useState('');
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [useAnyActive, setUseAnyActive] = useState(true);
  const [failWhenNotFound, setFailWhenNotFound] = useState(false);

  const handleTestFallback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fallbackResult = await emailTemplateMappingService.findWithFallback(formulario, modalidade);
      setResult(fallbackResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultTemplate = async () => {
    if (!defaultTemplateId.trim()) return;
    
    try {
      const success = await emailTemplateMappingService.setDefaultTemplate(formulario, defaultTemplateId);
      if (success) {
        alert(`Template padrão configurado para ${formulario}`);
      } else {
        alert('Template não encontrado ou inativo');
      }
    } catch (err) {
      alert('Erro ao configurar template padrão');
    }
  };

  const handleSetGlobalFallback = async () => {
    if (!globalFallbackId.trim()) return;
    
    try {
      const success = await emailTemplateMappingService.setGlobalFallbackTemplate(globalFallbackId);
      if (success) {
        alert('Template global de fallback configurado');
      } else {
        alert('Template não encontrado ou inativo');
      }
    } catch (err) {
      alert('Erro ao configurar template global');
    }
  };

  const handleUpdateConfig = () => {
    emailTemplateFallbackConfigManager.updateConfig({
      logging: {
        enabled: loggingEnabled,
        logFallbackUsage: loggingEnabled,
        logMappingNotFound: loggingEnabled
      },
      behavior: {
        useAnyActiveTemplateAsFallback: useAnyActive,
        failWhenNoTemplateFound: failWhenNotFound
      }
    });
    alert('Configuração atualizada');
  };

  const getFallbackTypeColor = (type?: string) => {
    switch (type) {
      case 'specific': return 'default';
      case 'configured_default': return 'secondary';
      case 'form_default': return 'outline';
      case 'any_active': return 'destructive';
      case 'global_fallback': return 'destructive';
      case 'none': return 'destructive';
      default: return 'outline';
    }
  };

  const getFallbackTypeLabel = (type?: string) => {
    switch (type) {
      case 'specific': return 'Template Específico';
      case 'configured_default': return 'Padrão Configurado';
      case 'form_default': return 'Padrão do Formulário';
      case 'any_active': return 'Qualquer Ativo';
      case 'global_fallback': return 'Fallback Global';
      case 'none': return 'Nenhum Encontrado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Sistema de Fallback de Templates</h1>
        <p className="text-muted-foreground mt-2">
          Demonstração do sistema hierárquico de fallback para templates de e-mail
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Sistema</CardTitle>
            <CardDescription>
              Configure o comportamento do sistema de fallback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template Padrão para {formulario}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ID do template padrão"
                  value={defaultTemplateId}
                  onChange={(e) => setDefaultTemplateId(e.target.value)}
                />
                <Button onClick={handleSetDefaultTemplate} size="sm">
                  Configurar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Template Global de Fallback</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ID do template global"
                  value={globalFallbackId}
                  onChange={(e) => setGlobalFallbackId(e.target.value)}
                />
                <Button onClick={handleSetGlobalFallback} size="sm">
                  Configurar
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Configurações de Comportamento</Label>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="logging"
                  checked={loggingEnabled}
                  onChange={(e) => setLoggingEnabled(e.target.checked)}
                />
                <Label htmlFor="logging">Habilitar logging detalhado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useAnyActive"
                  checked={useAnyActive}
                  onChange={(e) => setUseAnyActive(e.target.checked)}
                />
                <Label htmlFor="useAnyActive">Usar qualquer template ativo como fallback</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="failWhenNotFound"
                  checked={failWhenNotFound}
                  onChange={(e) => setFailWhenNotFound(e.target.checked)}
                />
                <Label htmlFor="failWhenNotFound">Falhar quando nenhum template é encontrado</Label>
              </div>

              <Button onClick={handleUpdateConfig} className="w-full">
                Atualizar Configuração
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teste */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Fallback</CardTitle>
            <CardDescription>
              Teste o sistema de fallback com diferentes combinações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formulário</Label>
                <Select value={formulario} onValueChange={(value: any) => setFormulario(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comply_fiscal">Comply Fiscal</SelectItem>
                    <SelectItem value="comply_edocs">Comply e-DOCS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={modalidade} onValueChange={(value: any) => setModalidade(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-premise">On-premise</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleTestFallback} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testando...' : 'Testar Sistema de Fallback'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resultado do Fallback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.template ? 'default' : 'destructive'}>
                      {result.template ? 'Template Encontrado' : 'Nenhum Template'}
                    </Badge>
                    <Badge variant={getFallbackTypeColor(result.fallbackType)}>
                      {getFallbackTypeLabel(result.fallbackType)}
                    </Badge>
                    <Badge variant={result.isDefault ? "outline" : "default"}>
                      {result.isDefault ? 'Fallback' : 'Específico'}
                    </Badge>
                  </div>

                  {result.template && (
                    <div className="space-y-2">
                      <div>
                        <strong>Nome:</strong> {result.template.nome}
                      </div>
                      <div>
                        <strong>ID:</strong> {result.template.id}
                      </div>
                      <div>
                        <strong>Assunto:</strong> {result.template.assunto}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <strong>Motivo:</strong> {result.fallbackReason}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hierarquia de Fallback */}
      <Card>
        <CardHeader>
          <CardTitle>Hierarquia de Fallback</CardTitle>
          <CardDescription>
            Ordem de prioridade na busca por templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">1</Badge>
              <span>Template específico (formulário + modalidade)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              <span>Template padrão configurado para o formulário</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">3</Badge>
              <span>Template padrão do formulário (modalidade null)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">4</Badge>
              <span>Qualquer template ativo do formulário (se habilitado)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">5</Badge>
              <span>Template global de fallback (se configurado)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">6</Badge>
              <span>Nenhum template encontrado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateFallbackExample;