import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Send, 
  Eye, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Mail,
  FileText,
  Settings,
  Clock,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emailTestService, type TestEmailRequest, type EmailTestLog } from '@/services/emailTestService';
import type { EmailTemplateMapping } from '@/services/emailTemplateMappingService';

export interface TestMappingDialogProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Função para fechar o dialog */
  onOpenChange: (open: boolean) => void;
  /** Mapeamento a ser testado */
  mapping: EmailTemplateMapping | null;
  /** E-mail padrão do administrador */
  defaultAdminEmail?: string;
}

const TestMappingDialog: React.FC<TestMappingDialogProps> = ({
  open,
  onOpenChange,
  mapping,
  defaultAdminEmail = 'admin@empresa.com'
}) => {
  const { toast } = useToast();
  
  // Estados do formulário
  const [recipientEmail, setRecipientEmail] = useState(defaultAdminEmail);
  const [testData, setTestData] = useState<Record<string, string>>({
    nome_cliente: 'João Silva',
    empresa: 'Empresa Teste Ltda',
    email: 'joao.silva@empresateste.com.br',
    telefone: '(11) 99999-9999'
  });
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [testLogs, setTestLogs] = useState<EmailTestLog[]>([]);
  const [activeTab, setActiveTab] = useState('preview');

  // Resetar estados quando o dialog abre/fecha ou mapeamento muda
  useEffect(() => {
    if (open && mapping) {
      setRecipientEmail(defaultAdminEmail);
      setPreviewHtml('');
      setActiveTab('preview');
      loadTestLogs();
      generatePreview();
    }
  }, [open, mapping, defaultAdminEmail]);

  // Gerar prévia do e-mail
  const generatePreview = async () => {
    if (!mapping?.template) return;

    try {
      setLoading(true);
      const preview = emailTestService.generateEmailPreview(mapping.template, testData);
      setPreviewHtml(preview);
    } catch (error) {
      console.error('Erro ao gerar prévia:', error);
      toast({
        title: "Erro ao gerar prévia",
        description: "Não foi possível gerar a prévia do e-mail",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar logs de teste
  const loadTestLogs = async () => {
    if (!mapping?.templateId) return;

    try {
      const logs = await emailTestService.getTestLogs(mapping.templateId, 10);
      setTestLogs(logs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      // Não mostrar toast para erro de logs, pois não é crítico
    }
  };

  // Enviar e-mail de teste
  const sendTestEmail = async () => {
    if (!mapping?.template) return;

    try {
      setLoading(true);

      const request: TestEmailRequest = {
        templateId: mapping.templateId,
        recipientEmail,
        formulario: mapping.formulario,
        modalidade: mapping.modalidade,
        testData
      };

      const result = await emailTestService.sendTestEmail(request);

      if (result.success) {
        toast({
          title: "E-mail enviado com sucesso",
          description: `E-mail de teste enviado para ${recipientEmail}`,
          variant: "default",
        });
        
        // Recarregar logs
        await loadTestLogs();
        
        // Mudar para aba de logs
        setActiveTab('logs');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        title: "Erro ao enviar e-mail",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados de teste
  const updateTestData = (key: string, value: string) => {
    setTestData(prev => ({ ...prev, [key]: value }));
  };

  // Regenerar prévia quando dados de teste mudam
  useEffect(() => {
    if (mapping?.template && previewHtml) {
      const timeoutId = setTimeout(() => {
        generatePreview();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [testData]);

  // Utilitários
  const getFormularioLabel = (formulario: 'comply_edocs' | 'comply_fiscal') => {
    return formulario === 'comply_edocs' ? 'Comply e-DOCS' : 'Comply Fiscal';
  };

  const getModalidadeLabel = (modalidade: 'on-premise' | 'saas') => {
    return modalidade === 'on-premise' ? 'On-premisse' : 'SaaS';
  };

  if (!mapping?.template) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Testar Mapeamento de Template
          </DialogTitle>
          <DialogDescription>
            Teste o envio de e-mail usando o template mapeado para validar se está funcionando corretamente.
          </DialogDescription>
        </DialogHeader>

        {/* Informações do mapeamento */}
        <div className="flex flex-wrap gap-2 py-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {getFormularioLabel(mapping.formulario)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            {getModalidadeLabel(mapping.modalidade)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {mapping.template.nome}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Prévia
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Enviar Teste
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Aba de Prévia */}
          <TabsContent value="preview" className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
              {/* Dados de teste */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Dados de Teste</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="nome_cliente" className="text-xs">Nome do Cliente</Label>
                      <Input
                        id="nome_cliente"
                        value={testData.nome_cliente}
                        onChange={(e) => updateTestData('nome_cliente', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="empresa" className="text-xs">Empresa</Label>
                      <Input
                        id="empresa"
                        value={testData.empresa}
                        onChange={(e) => updateTestData('empresa', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={testData.email}
                        onChange={(e) => updateTestData('email', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="telefone" className="text-xs">Telefone</Label>
                      <Input
                        id="telefone"
                        value={testData.telefone}
                        onChange={(e) => updateTestData('telefone', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button 
                      onClick={generatePreview} 
                      disabled={loading}
                      size="sm"
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      ) : (
                        <Eye className="h-3 w-3 mr-2" />
                      )}
                      Atualizar Prévia
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Prévia do e-mail */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Prévia do E-mail</CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : previewHtml ? (
                      <div className="border rounded-md h-full overflow-auto">
                        <iframe
                          srcDoc={previewHtml}
                          className="w-full h-full min-h-[400px]"
                          title="Prévia do E-mail"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <div className="text-center">
                          <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Clique em "Atualizar Prévia" para visualizar o e-mail</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Envio */}
          <TabsContent value="send" className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enviar E-mail de Teste</CardTitle>
                <DialogDescription>
                  Configure o destinatário e envie um e-mail de teste para validar o template.
                </DialogDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">E-mail do Destinatário</Label>
                  <Input
                    id="recipient"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                  />
                  <p className="text-sm text-gray-600">
                    O e-mail de teste será enviado para este endereço.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Aviso sobre E-mail de Teste</p>
                      <p>
                        Este e-mail será marcado como teste e incluirá informações de debug.
                        Não deve ser enviado para clientes reais.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={sendTestEmail} 
                  disabled={loading || !recipientEmail}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar E-mail de Teste
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Logs */}
          <TabsContent value="logs" className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Testes</CardTitle>
                <DialogDescription>
                  Logs de auditoria dos testes realizados com este template.
                </DialogDescription>
              </CardHeader>
              <CardContent>
                {testLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum teste realizado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {testLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 border rounded-md"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {log.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {log.success ? 'Teste enviado' : 'Falha no teste'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.recipient_email}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-1 mb-1">
                              <User className="h-3 w-3" />
                              {log.tested_by} • {new Date(log.tested_at).toLocaleString('pt-BR')}
                            </div>
                            {!log.success && log.error_message && (
                              <p className="text-red-600 mt-1">{log.error_message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestMappingDialog;