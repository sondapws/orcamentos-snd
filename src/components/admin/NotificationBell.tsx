import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, ChevronDown, Loader2 } from 'lucide-react';
import { useApprovalService } from '@/hooks/useApprovalService';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { 
    notifications, 
    notificationsLoading,
    notificationsPagination,
    markNotificationAsRead,
    loadNotifications,
    loadMoreNotifications
  } = useApprovalService();
  
  const navigate = useNavigate();

  // Filtrar apenas notificações não lidas
  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  const markAllAsRead = async () => {
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
    // Recarregar notificações após marcar todas como lidas
    loadNotifications();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote_rejected': return 'text-red-600';
      case 'new_quote_pending': return 'text-yellow-600';
      case 'quote_approved': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote_rejected': return '❌';
      case 'new_quote_pending': return '⏳';
      case 'quote_approved': return '✅';
      default: return '📋';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    await markNotificationAsRead(notification.id);
    
    // Navegar para o painel de aprovações
    navigate('/admin/aprovacoes');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-sonda-gray1 border-gray-200 dark:border-sonda-gray2">
        <DropdownMenuLabel className="flex items-center justify-between text-gray-700 dark:text-gray-300">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {unreadNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-sonda-gray3 text-sm">
            {notificationsLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando...
              </div>
            ) : (
              'Nenhuma notificação nova'
            )}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-sonda-gray2"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center mt-1">
                  <span className="text-sm mr-2">{getTypeIcon(notification.type)}</span>
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(notification.type)}`} />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notification.id);
                        }}
                        className="h-6 w-6 p-0"
                        title="Marcar como lida"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-sonda-gray3">{formatTimeAgo(notification.created_at)}</p>
                </div>
              </DropdownMenuItem>
            ))}
            
            {notificationsPagination.hasMore && (
              <DropdownMenuItem 
                className="flex items-center justify-center p-3 cursor-pointer border-t"
                onClick={loadMoreNotifications}
                disabled={notificationsLoading}
              >
                {notificationsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                Carregar mais
              </DropdownMenuItem>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;