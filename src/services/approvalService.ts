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
    try {
      const { emailService } = await import('./emailService');
      
      const emailData = {
        to: formData.email,
        subject: `Seu orçamento Comply - ${formData.razaoSocial}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Orçamento Aprovado</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Comply - Soluções Fiscais</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Olá <strong>${formData.responsavel}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
                Seu orçamento foi aprovado e processado com sucesso! Segue abaixo os dados da sua solicitação:
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
                <h3 style="color: #2563eb; margin-top: 0;">Dados da Solicitação</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong> ${formData.razaoSocial}</li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>CNPJ:</strong> ${formData.cnpj}</li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Responsável:</strong> ${formData.responsavel}</li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>E-mail:</strong> ${formData.email}</li>
                  <li style="padding: 8px 0;"><strong>Segmento:</strong> ${formData.segmento}</li>
                </ul>
              </div>
              
              <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0; color: #1e40af; font-weight: 500;">
                  📧 Em breve nossa equipe comercial entrará em contato para apresentar sua proposta personalizada.
                </p>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Atenciosamente,<br>
                <strong>Equipe Sonda</strong>
              </p>
            </div>
            
            <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px;">
              <p style="margin: 0;">© 2024 Sonda - Soluções em Tecnologia</p>
            </div>
          </div>
        `
      };

      const result = await emailService.sendEmail(emailData);
      
      if (result.success) {
        console.log('E-mail de orçamento enviado com sucesso via webhook');
      } else {
        console.error('Erro ao enviar e-mail de orçamento:', result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail de orçamento:', error);
    }
  }
  // Enviar orçamento diretamente (para @sonda.com)
  async sendQuoteDirectly(formData: any, productType: 'comply_edocs' | 'comply_fiscal' = 'comply_edocs'): Promise<boolean> {
    try {
      console.log('Enviando orçamento diretamente para @sonda.com:', formData.email);
      await this.sendQuoteEmail(formData);
      return true;
    } catch (error) {
      console.error('Erro ao enviar orçamento diretamente:', error);
      return false;
    }
  }
}

export const approvalService = new ApprovalService();