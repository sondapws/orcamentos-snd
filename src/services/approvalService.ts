import { supabase } from '@/integrations/supabase/client';

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

interface ApprovalSettings {
  id: string;
  email_notifications: boolean;
  approver_email: string;
  auto_approval_domains: string[];
}

class ApprovalService {

  // Submeter orçamento para aprovação
  async submitForApproval(formData: any, productType: 'comply_edocs' | 'comply_fiscal' = 'comply_edocs'): Promise<string> {
    try {
      // Inserir orçamento pendente no banco
      const { data: quote, error: quoteError } = await supabase
        .from('pending_quotes')
        .insert({
          form_data: formData,
          product_type: productType,
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Criar notificação
      await this.createNotification(
        'new_quote_pending',
        `Novo orçamento pendente de aprovação para ${formData.razaoSocial}`,
        quote.id
      );

      // Verificar se deve enviar e-mail
      const settings = await this.getSettings();
      if (settings?.email_notifications) {
        await this.sendApprovalEmail(quote);
      }

      return quote.id;
    } catch (error) {
      console.error('Erro ao submeter orçamento para aprovação:', error);
      throw error;
    }
  }

  // Aprovar orçamento
  async approveQuote(quoteId: string, approvedBy: string): Promise<boolean> {
    try {
      // Atualizar status do orçamento
      const { data: quote, error: updateError } = await supabase
        .from('pending_quotes')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Criar notificação
      await this.createNotification(
        'quote_approved',
        `Orçamento aprovado para ${quote.form_data.razaoSocial}`,
        quoteId
      );

      // Enviar e-mail com orçamento
      await this.sendQuoteEmail(quote.form_data);

      return true;
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      return false;
    }
  }

  // Rejeitar orçamento
  async rejectQuote(quoteId: string, rejectedBy: string, reason: string): Promise<boolean> {
    try {
      // Atualizar status do orçamento
      const { data: quote, error: updateError } = await supabase
        .from('pending_quotes')
        .update({
          status: 'rejected',
          rejected_by: rejectedBy,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Criar notificação
      await this.createNotification(
        'quote_rejected',
        `Orçamento rejeitado para ${quote.form_data.razaoSocial}`,
        quoteId
      );

      return true;
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error);
      return false;
    }
  }

  // Obter orçamentos pendentes
  async getPendingQuotes(): Promise<PendingQuote[]> {
    try {
      const { data, error } = await supabase
        .from('pending_quotes')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar orçamentos pendentes:', error);
      return [];
    }
  }

  // Obter todas as notificações
  async getNotifications(): Promise<ApprovalNotification[]> {
    try {
      const { data, error } = await supabase
        .from('approval_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  // Marcar notificação como lida
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  // Obter configurações
  async getSettings(): Promise<ApprovalSettings | null> {
    try {
      const { data, error } = await supabase
        .from('approval_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  }

  // Atualizar configurações
  async updateSettings(newSettings: Partial<ApprovalSettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('approval_settings')
        .update(newSettings)
        .eq('id', newSettings.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return false;
    }
  }

  // Verificar se email precisa de aprovação
  async requiresApproval(email: string): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings) return true; // Se não conseguir buscar configurações, requer aprovação por segurança

      const domain = email.toLowerCase().split('@')[1];
      return !settings.auto_approval_domains.includes(domain);
    } catch (error) {
      console.error('Erro ao verificar se requer aprovação:', error);
      return true; // Em caso de erro, requer aprovação por segurança
    }
  }

  private async createNotification(type: ApprovalNotification['type'], message: string, quoteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_notifications')
        .insert({
          type,
          message,
          quote_id: quoteId,
          read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  }

  private async sendApprovalEmail(quote: PendingQuote): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings) return;

      // Simular envio de email para aprovador
      console.log(`Email enviado para ${settings.approver_email}:`, {
        subject: `Novo orçamento pendente de aprovação - ${quote.form_data.razaoSocial}`,
        body: `
          Um novo orçamento foi submetido e aguarda aprovação:
          
          Empresa: ${quote.form_data.razaoSocial}
          CNPJ: ${quote.form_data.cnpj}
          Responsável: ${quote.form_data.responsavel}
          Email: ${quote.form_data.email}
          Produto: ${quote.product_type === 'comply_edocs' ? 'Comply e-DOCS' : 'Comply Fiscal'}
          Data: ${new Date(quote.submitted_at).toLocaleString('pt-BR')}
          
          Acesse o painel administrativo para revisar e aprovar.
        `
      });

      // Aqui você pode integrar com o serviço de e-mail real
      // await emailService.sendEmail({...});
    } catch (error) {
      console.error('Erro ao enviar e-mail de aprovação:', error);
    }
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