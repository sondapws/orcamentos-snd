import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { submissionLock } from '@/utils/submissionLock';
import { RefreshCw, Trash2, Lock, Unlock } from 'lucide-react';

interface SubmissionLockStatusProps {
  className?: string;
}

export const SubmissionLockStatus: React.FC<SubmissionLockStatusProps> = ({ className = "" }) => {
  const [status, setStatus] = useState({ locks: [], count: 0 });
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshStatus = () => {
    setStatus(submissionLock.getStatus());
  };

  const clearAllLocks = () => {
    submissionLock.clear();
    refreshStatus();
  };

  useEffect(() => {
    refreshStatus();
    
    if (autoRefresh) {
      const interval = setInterval(refreshStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <h3 className="font-semibold">Status dos Locks de Submissão</h3>
          <Badge variant={status.count > 0 ? "destructive" : "secondary"}>
            {status.count} ativo{status.count !== 1 ? 's' : ''}
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
          
          {status.count > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllLocks}
            >
              <Trash2 className="w-3 h-3" />
              Limpar Todos
            </Button>
          )}
        </div>
      </div>

      {status.count === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <Unlock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum lock ativo</p>
          <p className="text-sm">Sistema pronto para receber submissões</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">
            Locks ativos (previnem submissões duplicadas):
          </p>
          
          {status.locks.map((lock, index) => {
            const parts = lock.split('_');
            const type = parts[0];
            const identifier = parts.slice(1, -1).join('_');
            const product = parts[parts.length - 1];
            
            return (
              <div key={lock} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {type === 'submit' ? 'Submissão' : type === 'direct' ? 'Envio Direto' : 'E-mail'}
                  </Badge>
                  <span className="font-mono text-xs">{identifier}</span>
                  <Badge variant="secondary" className="text-xs">
                    {product === 'comply_edocs' ? 'e-DOCS' : product === 'comply_fiscal' ? 'Fiscal' : product}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    submissionLock.release(lock);
                    refreshStatus();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Unlock className="w-3 h-3" />
                  Liberar
                </Button>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t text-xs text-gray-500">
        <p>💡 Os locks são liberados automaticamente após 30 segundos ou quando a operação termina.</p>
        <p>🔒 Locks previnem duplicações por duplo clique ou submissões simultâneas.</p>
      </div>
    </Card>
  );
};