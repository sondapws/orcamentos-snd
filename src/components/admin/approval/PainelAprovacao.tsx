import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApprovalService } from '@/hooks/useApprovalService';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PainelAprovacao: React.FC = () => {
  const { 
    pendingQuotes, 
    notifications, 
    loading, 
    approveQuote, 
    rejectQuote, 
    markNotificationAsRead 
  } = useApprovalService();
  
  const { toast } = useToast();

  const handleApprove = async (quoteId: string) => {
    const success = await approveQuote(quoteId, 'admin');
    if (success) {
      toast({
        title: 'Orçamento Aprovado',
        description: 'O orçamento foi aprovado e o e-mail será enviado ao cliente.',
      });
    }
  };

  const handleReject = async (quoteId: string) => {
    const success = await rejectQuote(quoteId, 'admin', 'Rejeitado pelo administrador');
    if (success) {
      toast({
        title: 'Orçamento Rejeitado',
        description: 'O orçamento foi rejeitado.',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getProductTypeBadge = (productType: string) => {
    const isEdocs = productType === 'comply_edocs';
    return (
      <Badge variant={isEdocs ? 'default' : 'secondary'}>
        {isEdocs ? 'Comply e-DOCS' : 'Comply Fiscal'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel de Aprovação</h1>
        <Badge variant="outline">
          {pendingQuotes.length} pendente{pendingQuotes.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {notifications.filter(n => !n.read).length > 0 && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Notificações ({notifications.filter(n => !n.read).length})
          </h3>
          <div className="space-y-2">
            {notifications.filter(n => !n.read).slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between text-sm">
                <span>{notification.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  Marcar como lida
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {pendingQuotes.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Nenhum orçamento pendente</h3>
            <p className="text-gray-600">Todos os orçamentos foram processados.</p>
          </Card>
        ) : (
          pendingQuotes.map((quote) => (
            <Card key={quote.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{quote.form_data.razaoSocial}</h3>
                    {getProductTypeBadge(quote.product_type)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>CNPJ:</strong> {quote.form_data.cnpj}
                    </div>
                    <div>
                      <strong>Responsável:</strong> {quote.form_data.responsavel}
                    </div>
                    <div>
                      <strong>E-mail:</strong> {quote.form_data.email}
                    </div>
                    <div>
                      <strong>Submetido em:</strong> {formatDate(quote.submitted_at)}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">
                  <Clock className="w-3 h-3 mr-1" />
                  Pendente
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(quote.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(quote.id)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rejeitar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PainelAprovacao;