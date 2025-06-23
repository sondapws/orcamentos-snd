
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEmailLogs } from '@/hooks/useEmailLogs';

const EmailLogsViewer = () => {
  const { logs, loading, refreshLogs } = useEmailLogs();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Enviado</Badge>;
      case 'erro':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Logs de E-mail
          </div>
          <Button
            variant="outline" 
            size="sm"
            onClick={refreshLogs}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum log de e-mail encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{log.destinatario}</div>
                  {getStatusBadge(log.status)}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <strong>Assunto:</strong> {log.assunto}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  <strong>Enviado em:</strong> {formatDateTime(log.enviado_em)}
                </div>
                {log.erro && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <strong>Erro:</strong> {log.erro}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailLogsViewer;
