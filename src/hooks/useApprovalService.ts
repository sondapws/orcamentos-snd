import { useState, useEffect } from 'react';
import { approvalService } from '@/services/approvalService';

interface PendingQuote {
  id: string;
  form_data: any;
  product_type: 'comply_edocs' | 'comply_fiscal';
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

interface ApprovalNotification {
  id: string;
  type: 'new_quote_pending' | 'quote_approved' | 'quote_rejected';
  message: string;
  quote_id: string;
  read: boolean;
  created_at: string;
}

export const useApprovalService = () => {
  const [pendingQuotes, setPendingQuotes] = useState<PendingQuote[]>([]);
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadNotifications = async () => {
    try {
      const notifs = await approvalService.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
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
    loading,
    submitForApproval,
    approveQuote,
    rejectQuote,
    markNotificationAsRead,
    loadPendingQuotes,
    loadNotifications
  };
};