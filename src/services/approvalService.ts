import { supabase } from '@/integrations/supabase/client';
import type { 
  PendingQuote, 
  ApprovalNotification, 
  ApprovalSettings,
  NotificationsPaginationResult,
  ApprovalHistoryResult
} from '@/types/approval';

class ApprovalService {
  
  // Helper para fazer cast seguro dos tipos do Supabase
  private castToPendingQuote(data: any): PendingQuote {
    return {
      id: data.id,
      form_data: data.form_data,
      product_type: data.product_type as 'comply_edocs' | 'comply_fiscal',
      submitted_at: data.submitted_at,
      status: data.status as 'pending' | 'approved' | 'rejected',
      approved_by: data.approved_by,
      approved_at: data.approved_at,
      rejected_by: data.rejected_by,
      rejected_at: data.rejected_at,
      rejection_reason: data.rejection_reason,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  private castToApprovalNotification(data: any): ApprovalNotification {
    return {
      id: data.id,
      type: data.type as 'new_quote_pending' | 'quote_approved' | 'quote_rejected',
      message: data.message,
      quote_id: data.quote_id,
      read: data.read,
      created_at: data.created_at
    };
  }

  // Submeter orçamento para aprovação
  async submitForApproval(formData: any, productType: 'comply_edocs' | 'comply_fiscal' = 'comply_edocs'): Promise<string> {
    try {
      // Verificar se já existe um orçamento pendente para o mesmo CNPJ e produto
      const { data: existingQuote, error: checkError } = await supabase
        .from('pending_quotes')
        .select('id, status')
        .eq('status', 'pending')
        .eq('product_type', productType)
        .contains('form_data', { cnpj: formData.cnpj })
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      // Se já existe um orçamento pendente, retornar o ID existente
      if (existingQuote) {
        console.log('Orçamento já existe para este CNPJ e produto:', existingQuote.id);
        return existingQuote.id;
      }

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

      // Cast para o tipo correto
      const typedQuote = this.castToPendingQuote(quote);

      // Criar notificação
      await this.createNotification(
        'new_quote_pending',
        `Novo orçamento pendente de aprovação para ${formData.razaoSocial}`,
        typedQuote.id
      );

      // Verificar se deve enviar e-mail
      const settings = await this.getSettings();
      if (settings?.email_notifications) {
        await this.sendApprovalEmail(typedQuote);
      }

      return typedQuote.id;
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

      // Cast para o tipo correto
      const typedQuote = this.castToPendingQuote(quote);

      // Criar notificação
      await this.createNotification(
        'quote_approved',
        `Orçamento aprovado para ${(typedQuote.form_data as any)?.razaoSocial || 'Cliente'}`,
        quoteId
      );

      // Enviar e-mail com orçamento
      await this.sendQuoteEmail(typedQuote.form_data);

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

      // Cast para o tipo correto
      const typedQuote = this.castToPendingQuote(quote);

      // Criar notificação
      await this.createNotification(
        'quote_rejected',
        `Orçamento rejeitado para ${(typedQuote.form_data as any)?.razaoSocial || 'Cliente'}`,
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
      return (data || []).map(item => this.castToPendingQuote(item));
    } catch (error) {
      console.error('Erro ao buscar orçamentos pendentes:', error);
      return [];
    }
  }

  // Obter histórico de aprovações dos últimos 31 dias
  async getApprovalHistory(page: number = 1, limit: number = 10): Promise<ApprovalHistoryResult> {
    try {
      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      // Contar total de aprovações
      const { count, error: countError } = await supabase
        .from('pending_quotes')
        .select('*', { count: 'exact', head: true })
        .in('status', ['approved', 'rejected'])
        .gte('updated_at', thirtyOneDaysAgo.toISOString());

      if (countError) throw countError;

      // Buscar aprovações paginadas
      const offset = (page - 1) * limit;
      const { data, error } = await supabase
        .from('pending_quotes')
        .select('*')
        .in('status', ['approved', 'rejected'])
        .gte('updated_at', thirtyOneDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const hasMore = offset + limit < total;

      return {
        quotes: (data || []).map(item => this.castToPendingQuote(item)),
        total,
        hasMore
      };
    } catch (error) {
      console.error('Erro ao buscar histórico de aprovações:', error);
      return {
        quotes: [],
        total: 0,
        hasMore: false
      };
    }
  }

  // Obter notificações dos últimos 31 dias com paginação
  async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsPaginationResult> {
    try {
      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      // Contar total de notificações
      const { count, error: countError } = await supabase
        .from('approval_notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyOneDaysAgo.toISOString());

      if (countError) throw countError;

      // Buscar notificações paginadas
      const offset = (page - 1) * limit;
      const { data, error } = await supabase
        .from('approval_notifications')
        .select('*')
        .gte('created_at', thirtyOneDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const hasMore = offset + limit < total;

      return {
        notifications: (data || []).map(item => this.castToApprovalNotification(item)),
        total,
        hasMore
      };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return {
        notifications: [],
        total: 0,
        hasMore: false
      };
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

      const formData = quote.form_data as any;

      // Simular envio de email para aprovador
      console.log(`Email enviado para ${settings.approver_email}:`, {
        subject: `Novo orçamento pendente de aprovação - ${formData?.razaoSocial || 'Cliente'}`,
        body: `
          Um novo orçamento foi submetido e aguarda aprovação:
          
          Empresa: ${formData?.razaoSocial || 'N/A'}
          CNPJ: ${formData?.cnpj || 'N/A'}
          Responsável: ${formData?.responsavel || 'N/A'}
          Email: ${formData?.email || 'N/A'}
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