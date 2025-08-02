import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { submissionIdempotency } from '@/utils/submissionIdempotency';
import { RefreshCw, Trash2, Shield, ShieldCheck } from 'lucide-react';

interface SubmissionIdempotencyStatusProps {
  className?: string;
}

export const SubmissionIdempotencyStatus: React.FC<SubmissionIdempotencyStatusProps> = ({ className = "" }) => {
  const [stats, setStats] = useState({ processed: 0, oldest: null, newest: null });
  const [processedList, setProcessedList] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshStatus = () => {
    setStats(submissionIdempotency.getStats());
    setProcessedList(submissionIdempotency.listProcessed());
  };

  const clearAll = () => {
    submissionIdempotency.clear();
    refreshStatus();
  };

  useEffect(() => {
    refreshStatus();
    
    if (autoRefresh) {
      const interval = setInterval(refreshStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <h3 className="font-semibold">Sistema de Idempotência</h3>
          <Badge variant={stats.processed > 0 ? "default" : "secondary"}>
            {stats.processed} processada{stats.processed !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
          >
            <RefreshCw className="w-3 h-3" />
            Atualizar
          </Button>
          
          {stats.processed > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
            >
              <Trash2 className="w-3 h-3" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {stats.processed === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma submissão processada</p>
          <p className="text-sm">Sistema pronto para receber submissões</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total processadas:</span>
              <span className="ml-2">{stats.processed}</span>
            </div>
            <div>
              <span className="font-medium">Mais antiga:</span>
              <span className="ml-2 text-xs">
                {stats.oldest ? new Date(stats.oldest).toLocaleTimeString('pt-BR') : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">
              Submissões processadas (últimas 10):
            </p>
            
            {processedList.slice(-10).reverse().map((submissionId, index) => (
              <div key={submissionId} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{processedList.length - index}
                  </Badge>
                  <span className="font-mono text-xs">{submissionId}</span>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  Processada
                </Badge>
              </div>
            ))}

            {processedList.length > 10 && (
              <p className="text-xs text-gray-500 text-center">
                ... e mais {processedList.length - 10} submissões
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t text-xs text-gray-500">
        <p>🛡️ O sistema de idempotência garante que cada submissão seja processada apenas uma vez.</p>
        <p>🧹 Submissões são automaticamente limpas após 10 minutos.</p>
        <p>🔄 Em caso de erro, a submissão é desmarcada para permitir retry.</p>
      </div>
    </Card>
  );
};