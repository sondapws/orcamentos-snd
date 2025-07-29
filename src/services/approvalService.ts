import { FormDataFiscal } from '@/types/formDataFiscal';

interface PendingQuote {
  id: string;
  formData: any;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}

interface ApprovalNotification {
  id: string;
  type: 'new_quote_pending' | 'quote_approved' | 'quote_rejected';
  message: string;
  createdAt: Date;
  read: boolean;
  quoteId: string;
}

interface ApprovalSettings {
  emailNotifications: boolean;
  approverEmail: string;
  autoApprovalDomains: string[];
}

class ApprovalService {
  private pendingQuotes: PendingQuote[] = [];
  private notifications: ApprovalNotification[] = [];
  private settings: ApprovalSettings = {
    emailNotifications: true,
    approverEmail: 'admin@sonda.com',
    autoApprovalDomains: ['sonda.com']
  };

  // Submeter orçamento para aprovação
  submitForApproval(formData: any): string {
    const quoteId = this.generateId();
    const pendingQuote: PendingQuote = {
      id: quoteId,
      formData,
      submittedAt: new Date(),
      status: 'pending'
    };

    this.pendingQuotes.push(pendingQuote);
    this.createNotification('new_quote_pending', `Novo orçamento pendente de aprovação para ${formData.razaoSocial}`, quoteId);
    
    if (this.settings.emailNotifications) {
      this.sendApprovalEmail(pendingQuote);
    }

    return quoteId;
  }

  // Aprovar orçamento
  approveQuote(quoteId: string, approvedBy: string): boolean {
    const quote = this.pendingQuotes.find(q => q.id === quoteId);
    if (!quote) return false;

    quote.status = 'approved';
    quote.approvedBy = approvedBy;
    quote.approvedAt = new Date();

    this.createNotification('quote_approved', `Orçamento aprovado para ${quote.formData.razaoSocial}`, quoteId);
    this.sendQuoteEmail(quote.formData);

    return true;
  }

  // Rejeitar orçamento
  rejectQuote(quoteId: string, rejectedBy: string, reason: string): boolean {
    const quote = this.pendingQuotes.find(q => q.id === quoteId);
    if (!quote) return false;

    quote.status = 'rejected';
    quote.rejectedBy = rejectedBy;
    quote.rejectedAt = new Date();
    quote.rejectionReason = reason;

    this.createNotification('quote_rejected', `Orçamento rejeitado para ${quote.formData.razaoSocial}`, quoteId);

    return true;
  }

  // Obter orçamentos pendentes
  getPendingQuotes(): PendingQuote[] {
    return this.pendingQuotes.filter(q => q.status === 'pending');
  }

  // Obter todas as notificações
  getNotifications(): ApprovalNotification[] {
    return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Marcar notificação como lida
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Obter configurações
  getSettings(): ApprovalSettings {
    return { ...this.settings };
  }

  // Atualizar configurações
  updateSettings(newSettings: Partial<ApprovalSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Verificar se email precisa de aprovação
  requiresApproval(email: string): boolean {
    const domain = email.toLowerCase().split('@')[1];
    return !this.settings.autoApprovalDomains.includes(domain);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private createNotification(type: ApprovalNotification['type'], message: string, quoteId: string): void {
    const notification: ApprovalNotification = {
      id: this.generateId(),
      type,
      message,
      createdAt: new Date(),
      read: false,
      quoteId
    };
    this.notifications.push(notification);
  }

  private async sendApprovalEmail(quote: PendingQuote): Promise<void> {
    // Simular envio de email para aprovador
    console.log(`Email enviado para ${this.settings.approverEmail}:`, {
      subject: `Novo orçamento pendente de aprovação - ${quote.formData.razaoSocial}`,
      body: `
        Um novo orçamento foi submetido e aguarda aprovação:
        
        Empresa: ${quote.formData.razaoSocial}
        CNPJ: ${quote.formData.cnpj}
        Responsável: ${quote.formData.responsavel}
        Email: ${quote.formData.email}
        Data: ${quote.submittedAt.toLocaleString('pt-BR')}
        
        Acesse o painel administrativo para revisar e aprovar.
      `
    });
  }

  private async sendQuoteEmail(formData: any): Promise<void> {
    // Simular envio de email com orçamento
    console.log(`Email com orçamento enviado para ${formData.email}:`, {
      subject: `Seu orçamento Comply - ${formData.razaoSocial}`,
      body: `
        Olá ${formData.responsavel},
        
        Seu orçamento foi aprovado e está anexado a este email.
        
        Dados da solicitação:
        - Empresa: ${formData.razaoSocial}
        - CNPJ: ${formData.cnpj}
        
        Em breve nossa equipe comercial entrará em contato.
        
        Atenciosamente,
        Equipe Sonda
      `
    });
  }
}

export const approvalService = new ApprovalService();