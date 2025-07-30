import { useState, useEffect } from 'react';
import { approvalService } from '@/services/approvalService';
import type { PendingQuote, ApprovalNotification } from '@/types/approval';

export const useApprovalService = () => {
  const [pendingQuotes, setPendingQuotes] = useState<PendingQuote[]>([]);
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<PendingQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notificationsPagination, setNotificationsPagination] = useState({
    page: 1,
    hasMore: false,
    total: 0
  });
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    hasMore: false,
    total: 0
  });

  const loadPendingQuotes = async () => {
    setLoading(true);
    try {
      const quotes = await approvalService.getPendingQuotes();
      setPendingQuotes(quotes);
    } catch (error) {
      console.error('Erro ao carregar orçamentos pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (page: number = 1, append: boolean = false) => {
    setNotificationsLoading(true);
    try {
      const result = await approvalService.getNotifications(page, 20);
      
      if (append) {
        setNotifications(prev => [...prev, ...result.notifications]);
      } else {
        setNotifications(result.notifications);
      }
      
      setNotificationsPagination({
        page,
        hasMore: result.hasMore,
        total: result.total
      });
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadApprovalHistory = async (page: number = 1, append: boolean = false) => {
    setHistoryLoading(true);
    try {
      const result = await approvalService.getApprovalHistory(page, 10);
      
      if (append) {
        setApprovalHistory(prev => [...prev, ...result.quotes]);
      } else {
        setApprovalHistory(result.quotes);
      }
      
      setHistoryPagination({
        page,
        hasMore: result.hasMore,
        total: result.total
      });
    } catch (error) {
      console.error('Erro ao carregar histórico de aprovações:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadMoreNotifications = () => {
    if (notificationsPagination.hasMore && !notificationsLoading) {
      loadNotifications(notificationsPagination.page + 1, true);
    }
  };

  const loadMoreHistory = () => {
    if (historyPagination.hasMore && !historyLoading) {
      loadApprovalHistory(historyPagination.page + 1, true);
    }
  };

  const submitForApproval = async (formData: any, productType: 'comply_edocs' | 'comply_fiscal') => {
    try {
      const quoteId = await approvalService.submitForApproval(formData, productType);
      await loadPendingQuotes(); // Recarregar lista
      return quoteId;
    } catch (error) {
      console.error('Erro ao submeter para aprovação:', error);
      throw error;
    }
  };

  const approveQuote = async (quoteId: string, approvedBy: string) => {
    try {
      const success = await approvalService.approveQuote(quoteId, approvedBy);
      if (success) {
        await loadPendingQuotes(); // Recarregar lista
        await loadNotifications(); // Recarregar notificações
        await loadApprovalHistory(); // Recarregar histórico
      }
      return success;
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      return false;
    }
  };

  const rejectQuote = async (quoteId: string, rejectedBy: string, reason: string) => {
    try {
      const success = await approvalService.rejectQuote(quoteId, rejectedBy, reason);
      if (success) {
        await loadPendingQuotes(); // Recarregar lista
        await loadNotifications(); // Recarregar notificações
        await loadApprovalHistory(); // Recarregar histórico
      }
      return success;
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error);
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await approvalService.markNotificationAsRead(notificationId);
      await loadNotifications(); // Recarregar notificações
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadPendingQuotes();
        await loadNotifications();
        await loadApprovalHistory();
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  return {
    pendingQuotes,
    notifications,
    approvalHistory,
    loading,
    notificationsLoading,
    historyLoading,
    notificationsPagination,
    historyPagination,
    submitForApproval,
    approveQuote,
    rejectQuote,
    markNotificationAsRead,
    loadPendingQuotes,
    loadNotifications,
    loadApprovalHistory,
    loadMoreNotifications,
    loadMoreHistory
  };
};