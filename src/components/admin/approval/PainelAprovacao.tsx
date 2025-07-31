import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApprovalService } from '@/hooks/useApprovalService';
import { useDataCleanup } from '@/hooks/useDataCleanup';
import { CheckCircle, XCircle, Clock, History, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PainelAprovacao: React.FC = () => {
  const {
    pendingQuotes,
    approvalHistory,
    loading,
    historyLoading,
    historyPagination,
    approveQuote,
    rejectQuote,
    loadMoreHistory,
    loadApprovalHistory,
    loadPendingQuotes
  } = useApprovalService();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [processingQuotes, setProcessingQuotes] = useState<Set<string>>(new Set());
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Função para lidar com mudança de aba
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Se mudou para a aba histórico, recarregar os dados
    if (value === 'history') {
      loadApprovalHistory();
    }
  };

  // Configurar limpeza automática de dados
  useDataCleanup();

  const handleApprove = async (quoteId: string) => {
    // Prevenir duplo clique
    if (processingQuotes.has(quoteId)) {
      return;
    }

    setProcessingQuotes(prev => new Set(prev).add(quoteId));

    try {
      const success = await approveQuote(quoteId, 'admin');
      if (success) {
        toast({
          title: 'Orçamento Aprovado',
          description: 'O orçamento foi aprovado e o e-mail será enviado ao cliente.',
        });
      }
    } finally {
      setProcessingQuotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(quoteId);
        return newSet;
      });
    }
  };

  const handleRejectClick = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo da rejeição.',
        variant: 'destructive'
      });
      return;
    }

    // Prevenir duplo clique
    if (processingQuotes.has(selectedQuoteId)) {
      return;
    }

    setProcessingQuotes(prev => new Set(prev).add(selectedQuoteId));

    try {
      const success = await rejectQuote(selectedQuoteId, 'admin', rejectionReason);
      if (success) {
        toast({
          title: 'Orçamento Rejeitado',
          description: 'O orçamento foi rejeitado.',
          variant: 'destructive'
        });
        // Fechar modal e limpar estados
        handleCloseModal();
      }
    } finally {
      setProcessingQuotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedQuoteId);
        return newSet;
      });
    }
  };

  const handleCloseModal = () => {
    setRejectModalOpen(false);
    setSelectedQuoteId('');
    setRejectionReason('');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
    }
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
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {pendingQuotes.length} pendente{pendingQuotes.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary">
            {historyPagination.total} processado{historyPagination.total !== 1 ? 's' : ''} (31 dias)
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setRefreshing(true);
              await loadPendingQuotes();
              setRefreshing(false);
              toast({
                title: "Dados atualizados",
                description: "Lista de orçamentos pendentes foi recarregada.",
              });
            }}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico ({historyPagination.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
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
                        <h3 className="text-lg font-semibold">{(quote.form_data as any)?.razaoSocial}</h3>
                        {getProductTypeBadge(quote.product_type)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>CNPJ:</strong> {(quote.form_data as any)?.cnpj}
                        </div>
                        <div>
                          <strong>Responsável:</strong> {(quote.form_data as any)?.responsavel}
                        </div>
                        <div>
                          <strong>E-mail:</strong> {(quote.form_data as any)?.email}
                        </div>
                        <div>
                          <strong>Submetido em:</strong> {formatDate(quote.submitted_at)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(quote.id)}
                      disabled={processingQuotes.has(quote.id)}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingQuotes.has(quote.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectClick(quote.id)}
                      disabled={processingQuotes.has(quote.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Histórico de Aprovações</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadApprovalHistory()}
              disabled={historyLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <div className="grid gap-4">
            {approvalHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Nenhum histórico encontrado</h3>
                <p className="text-gray-600">Não há aprovações nos últimos 31 dias.</p>
              </Card>
            ) : (
              <>
                {approvalHistory.map((quote) => (
                  <Card key={quote.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{(quote.form_data as any)?.razaoSocial}</h3>
                          {getProductTypeBadge(quote.product_type)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>CNPJ:</strong> {(quote.form_data as any)?.cnpj}
                          </div>
                          <div>
                            <strong>Responsável:</strong> {(quote.form_data as any)?.responsavel}
                          </div>
                          <div>
                            <strong>E-mail:</strong> {(quote.form_data as any)?.email}
                          </div>
                          <div>
                            <strong>Processado em:</strong> {formatDate(quote.approved_at || quote.rejected_at || quote.updated_at)}
                          </div>
                          {quote.status === 'approved' && quote.approved_by && (
                            <div>
                              <strong>Aprovado por:</strong> {quote.approved_by}
                            </div>
                          )}
                          {quote.status === 'rejected' && quote.rejected_by && (
                            <div>
                              <strong>Rejeitado por:</strong> {quote.rejected_by}
                            </div>
                          )}
                          {quote.rejection_reason && (
                            <div className="col-span-2">
                              <strong>Motivo da rejeição:</strong> {quote.rejection_reason}
                            </div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(quote.status)}
                    </div>
                  </Card>
                ))}

                {historyPagination.hasMore && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreHistory}
                      disabled={historyLoading}
                      className="flex items-center gap-2"
                    >
                      {historyLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <History className="w-4 h-4" />
                      )}
                      Carregar mais histórico
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Rejeição */}
      <Dialog open={rejectModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeitar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Motivo da rejeição *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Informe o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={processingQuotes.has(selectedQuoteId)}
            >
              {processingQuotes.has(selectedQuoteId) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                'Confirmar Rejeição'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PainelAprovacao;