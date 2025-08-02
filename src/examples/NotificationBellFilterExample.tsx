import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X } from 'lucide-react';

/**
 * Exemplo demonstrando o filtro de notificações no sino
 * 
 * Após a atualização, o sino de notificações exibe apenas:
 * - Notificações não lidas (read: false)
 * - Do tipo 'new_quote_pending' (novos orçamentos pendentes)
 * 
 * Notificações de orçamentos aprovados ou rejeitados não aparecem mais no sino.
 */
const NotificationBellFilterExample = () => {
  // Exemplo de notificações do sistema
  const allNotifications = [
    {
      id: '1',
      type: 'new_quote_pending',
      message: 'Novo orçamento pendente de aprovação para SONDA PROCWORK',
      read: false,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'quote_approved',
      message: 'Orçamento aprovado para SONDA PROCWORK',
      read: false,
      created_at: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      type: 'quote_rejected',
      message: 'Orçamento rejeitado para SONDA PROCWORK',
      read: false,
      created_at: '2024-01-15T08:45:00Z'
    },
    {
      id: '4',
      type: 'new_quote_pending',
      message: 'Novo orçamento pendente de aprovação para EMPRESA XYZ',
      read: true, // Já lida
      created_at: '2024-01-15T08:00:00Z'
    }
  ];

  // Filtro aplicado no NotificationBell (apenas pendentes não lidas)
  const visibleInBell = allNotifications.filter(n => !n.read && n.type === 'new_quote_pending');
  
  // Todas as notificações não lidas (comportamento anterior)
  const previousBehavior = allNotifications.filter(n => !n.read);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote_rejected': return <X className="w-4 h-4 text-red-600" />;
      case 'new_quote_pending': return <Bell className="w-4 h-4 text-yellow-600" />;
      case 'quote_approved': return <Check className="w-4 h-4 text-green-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'quote_rejected': return 'Rejeitado';
      case 'new_quote_pending': return 'Pendente';
      case 'quote_approved': return 'Aprovado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Filtro de Notificações no Sino
        </h2>
        <p className="text-gray-600">
          Demonstração do novo comportamento: apenas orçamentos pendentes aparecem no sino
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Comportamento Atual (Após Ajuste) */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Bell className="w-5 h-5" />
              Comportamento Atual
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {visibleInBell.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Apenas notificações de novos orçamentos pendentes (não lidas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visibleInBell.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  Nenhuma notificação de orçamento pendente
                </p>
              ) : (
                visibleInBell.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comportamento Anterior */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Bell className="w-5 h-5" />
              Comportamento Anterior
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {previousBehavior.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Todas as notificações não lidas (incluindo aprovados/rejeitados)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {previousBehavior.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {getTypeIcon(notification.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(notification.type)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explicação das Mudanças */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-700">Resumo das Mudanças</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Antes:</strong> O sino mostrava todas as notificações não lidas (pendentes, aprovados, rejeitados)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Agora:</strong> O sino mostra apenas notificações de novos orçamentos pendentes não lidas
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Benefício:</strong> Reduz ruído visual e foca apenas no que requer ação (aprovação)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Código da Mudança */}
      <Card>
        <CardHeader>
          <CardTitle>Código da Mudança</CardTitle>
          <CardDescription>
            Alteração no filtro de notificações em NotificationBell.tsx
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ Antes:</h4>
              <pre className="bg-red-50 p-3 rounded text-sm border border-red-200">
{`// Filtrar apenas notificações não lidas
const unreadNotifications = notifications.filter(n => !n.read);`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Depois:</h4>
              <pre className="bg-green-50 p-3 rounded text-sm border border-green-200">
{`// Filtrar apenas notificações não lidas de novos orçamentos pendentes
const unreadNotifications = notifications.filter(n => !n.read && n.type === 'new_quote_pending');`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationBellFilterExample;