import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Mail, FileText, Settings } from 'lucide-react';
import TestMappingDialog from '@/components/admin/email/TestMappingDialog';
import type { EmailTemplateMapping } from '@/services/emailTemplateMappingService';
import type { EmailTemplate } from '@/types/approval';

/**
 * Exemplo de uso do componente TestMappingDialog
 * 
 * Este exemplo demonstra como integrar o dialog de teste de mapeamentos
 * em uma interface administrativa, permitindo que administradores testem
 * templates de e-mail configurados para diferentes combinações de
 * formulário e modalidade.
 */

const TestMappingDialogExample: React.FC = () => {
  const [selectedMapping, setSelectedMapping] = useState<EmailTemplateMapping | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dados de exemplo para demonstração
  const exampleMappings: EmailTemplateMapping[] = [
    {
      formulario: 'comply_edocs',
      modalidade: 'saas',
      templateId: 'template-1',
      template: {
        id: 'template-1',
        nome: 'Template Comply e-DOCS SaaS',
        assunto: 'Bem-vindo ao Comply e-DOCS - {{nome_cliente}}',
        corpo: `
          <h2>Olá {{nome_cliente}}!</h2>
          <p>Seja bem-vindo ao <strong>Comply e-DOCS</strong> na modalidade SaaS.</p>
          <p>Sua empresa <strong>{{empresa}}</strong> foi cadastrada com sucesso.</p>
          <p>Em breve entraremos em contato através do e-mail {{email}} ou telefone {{telefone}}.</p>
          <hr>
          <p><small>Este e-mail foi enviado automaticamente pelo sistema.</small></p>
        `,
        descricao: 'Template para clientes Comply e-DOCS SaaS',
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_edocs',
        modalidade: 'saas',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z'
      }
    },
    {
      formulario: 'comply_edocs',
      modalidade: 'on-premise',
      templateId: 'template-2',
      template: {
        id: 'template-2',
        nome: 'Template Comply e-DOCS On-Premise',
        assunto: 'Comply e-DOCS On-Premise - Solicitação de {{nome_cliente}}',
        corpo: `
          <h2>Solicitação Comply e-DOCS On-Premise</h2>
          <p>Recebemos sua solicitação para o <strong>Comply e-DOCS</strong> na modalidade On-Premise.</p>
          <p><strong>Dados da solicitação:</strong></p>
          <ul>
            <li>Cliente: {{nome_cliente}}</li>
            <li>Empresa: {{empresa}}</li>
            <li>E-mail: {{email}}</li>
            <li>Telefone: {{telefone}}</li>
          </ul>
          <p>Nossa equipe técnica entrará em contato para discutir os detalhes da implementação.</p>
        `,
        descricao: 'Template para clientes Comply e-DOCS On-Premise',
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_edocs',
        modalidade: 'on-premise',
        created_at: '2025-01-01T11:00:00Z',
        updated_at: '2025-01-01T11:00:00Z'
      }
    },
    {
      formulario: 'comply_fiscal',
      modalidade: 'saas',
      templateId: 'template-3',
      template: {
        id: 'template-3',
        nome: 'Template Comply Fiscal SaaS',
        assunto: 'Comply Fiscal SaaS - Proposta para {{empresa}}',
        corpo: `
          <h2>Proposta Comply Fiscal SaaS</h2>
          <p>Prezado(a) {{nome_cliente}},</p>
          <p>Agradecemos o interesse da <strong>{{empresa}}</strong> em nosso produto Comply Fiscal SaaS.</p>
          <p>Nossa solução em nuvem oferece:</p>
          <ul>
            <li>Gestão completa de obrigações fiscais</li>
            <li>Atualizações automáticas de legislação</li>
            <li>Suporte técnico especializado</li>
            <li>Interface intuitiva e moderna</li>
          </ul>
          <p>Entraremos em contato em breve para apresentar nossa proposta personalizada.</p>
          <p>Atenciosamente,<br>Equipe Comply Fiscal</p>
        `,
        descricao: 'Template para clientes Comply Fiscal SaaS',
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal',
        modalidade: 'saas',
        created_at: '2025-01-01T12:00:00Z',
        updated_at: '2025-01-01T12:00:00Z'
      }
    },
    {
      formulario: 'comply_fiscal',
      modalidade: 'on-premise',
      templateId: 'template-4',
      template: {
        id: 'template-4',
        nome: 'Template Comply Fiscal On-Premise',
        assunto: 'Comply Fiscal On-Premise - {{nome_cliente}}',
        corpo: `
          <h2>Comply Fiscal On-Premise</h2>
          <p>Caro {{nome_cliente}},</p>
          <p>Recebemos sua solicitação para implementação do Comply Fiscal On-Premise na {{empresa}}.</p>
          <p><strong>Próximos passos:</strong></p>
          <ol>
            <li>Análise técnica do ambiente</li>
            <li>Dimensionamento da solução</li>
            <li>Proposta comercial personalizada</li>
            <li>Cronograma de implementação</li>
          </ol>
          <p>Nosso consultor técnico entrará em contato através do telefone {{telefone}} para agendar uma reunião.</p>
          <p>Cordialmente,<br>Equipe Técnica Comply</p>
        `,
        descricao: 'Template para clientes Comply Fiscal On-Premise',
        tipo: 'orcamento',
        ativo: true,
        vinculado_formulario: true,
        formulario: 'comply_fiscal',
        modalidade: 'on-premise',
        created_at: '2025-01-01T13:00:00Z',
        updated_at: '2025-01-01T13:00:00Z'
      }
    }
  ];

  const openTestDialog = (mapping: EmailTemplateMapping) => {
    setSelectedMapping(mapping);
    setDialogOpen(true);
  };

  const getFormularioLabel = (formulario: 'comply_edocs' | 'comply_fiscal') => {
    return formulario === 'comply_edocs' ? 'Comply e-DOCS' : 'Comply Fiscal';
  };

  const getModalidadeLabel = (modalidade: 'on-premise' | 'saas') => {
    return modalidade === 'on-premise' ? 'On-premisse' : 'SaaS';
  };

  const getFormularioIcon = (formulario: 'comply_edocs' | 'comply_fiscal') => {
    return formulario === 'comply_edocs' ? FileText : Settings;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Exemplo: Teste de Mapeamentos de Templates
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Este exemplo demonstra como usar o componente TestMappingDialog para testar
          templates de e-mail configurados para diferentes combinações de formulário e modalidade.
        </p>
      </div>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Como usar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Clique no botão "Testar" de qualquer mapeamento abaixo</li>
            <li>Na aba "Prévia", visualize como o e-mail será renderizado</li>
            <li>Modifique os dados de teste para ver diferentes variações</li>
            <li>Na aba "Enviar Teste", configure o destinatário e envie um e-mail real</li>
            <li>Na aba "Histórico", veja os logs de todos os testes realizados</li>
          </ol>
        </CardContent>
      </Card>

      {/* Lista de mapeamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exampleMappings.map((mapping) => {
          const FormularioIcon = getFormularioIcon(mapping.formulario);
          
          return (
            <Card key={`${mapping.formulario}-${mapping.modalidade}`} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FormularioIcon className="h-5 w-5 text-blue-600" />
                      {mapping.template?.nome}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {getFormularioLabel(mapping.formulario)}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {getModalidadeLabel(mapping.modalidade)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTestDialog(mapping)}
                    className="flex items-center gap-1 shrink-0"
                  >
                    <TestTube className="h-3 w-3" />
                    Testar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Assunto:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {mapping.template?.assunto}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Descrição:</h4>
                    <p className="text-sm text-gray-600">
                      {mapping.template?.descricao}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {mapping.templateId}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-800">Recursos do TestMappingDialog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Prévia Interativa
              </h4>
              <p className="text-sm text-gray-600">
                Visualize como o e-mail será renderizado com dados de teste personalizáveis.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Envio de Teste
              </h4>
              <p className="text-sm text-gray-600">
                Envie e-mails de teste reais para validar templates antes da produção.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Logs de Auditoria
              </h4>
              <p className="text-sm text-gray-600">
                Acompanhe histórico completo de todos os testes realizados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de teste */}
      <TestMappingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mapping={selectedMapping}
        defaultAdminEmail="admin@exemplo.com"
      />
    </div>
  );
};

export default TestMappingDialogExample;