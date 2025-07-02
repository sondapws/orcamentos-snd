
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

import { supabase } from '@/integrations/supabase/client';

// URL padrão do Power Automate para envio de e-mails (fallback)
const POWER_AUTOMATE_URL = 'https://prod-15.westus.logic.azure.com:443/workflows/6dcbd557c39b4d74afe41a7f223caf2e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cyD7xWu4TpxXXsSWcH9h8BU5NptbrLkqPVCh0WrXasU';

// Função para buscar URL do webhook configurado
const getWebhookUrl = async (): Promise<string> => {
  try {
    const { data: webhookConfig } = await supabase
      .from('webhook_config')
      .select('webhook_url')
      .eq('ativo', true)
      .limit(1)
      .single();

    return webhookConfig?.webhook_url || POWER_AUTOMATE_URL;
  } catch (error) {
    console.warn('Usando URL padrão do webhook:', error);
    return POWER_AUTOMATE_URL;
  }
};

// Função para registrar log de envio
const logEmail = async (destinatario: string, assunto: string, status: 'enviado' | 'erro', erro?: string) => {
  try {
    await supabase
      .from('email_logs')
      .insert([{
        destinatario,
        assunto,
        status,
        erro,
        enviado_em: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Erro ao registrar log de e-mail:', error);
  }
};

export const emailService = {
  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      console.log('Enviando e-mail via Power Automate:', {
        to: emailData.to,
        subject: emailData.subject
      });

      // Buscar URL do webhook configurado
      const webhookUrl = await getWebhookUrl();

      // Converter HTML para texto simples para mensagem
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = emailData.html;
      const mensagem = tempDiv.textContent || tempDiv.innerText || emailData.html;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'no-cors',
        body: JSON.stringify({
          nome: emailData.subject,
          email: emailData.to,
          mensagem: emailData.html // Enviar HTML completo
        })
      });

      // Registrar log de sucesso
      await logEmail(emailData.to, emailData.subject, 'enviado');

      console.log('E-mail enviado com sucesso via Power Automate');
      
      return {
        success: true,
        message: 'E-mail enviado com sucesso via Power Automate'
      };
    } catch (error) {
      console.error('Erro ao enviar e-mail via Power Automate:', error);
      
      // Registrar log de erro
      await logEmail(
        emailData.to, 
        emailData.subject, 
        'erro', 
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no envio via Power Automate'
      };
    }
  },

  async sendTestEmail(to: string, template: { assunto: string; corpo: string }): Promise<EmailResponse> {
    // Dados de teste
    const dadosTeste = {
      razaoSocial: 'Empresa de Teste Ltda',
      responsavel: 'João da Silva',
      cnpj: '12.345.678/0001-90',
      segmento: 'Indústria',
      modalidade: 'SaaS',
      valor: 'R$ 5.000,00'
    };

    // Substituir variáveis no template
    let assuntoFinal = template.assunto;
    let corpoFinal = template.corpo;

    Object.entries(dadosTeste).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      assuntoFinal = assuntoFinal.replace(regex, value);
      corpoFinal = corpoFinal.replace(regex, value);
    });

    console.log('Enviando e-mail de teste via Power Automate:', {
      to,
      subject: assuntoFinal
    });

    try {
      // Buscar URL do webhook configurado
      const webhookUrl = await getWebhookUrl();

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'no-cors',
        body: JSON.stringify({
          nome: 'E-mail de Teste - Sistema de Orçamentos',
          email: to,
          mensagem: corpoFinal // Enviar HTML do template
        })
      });

      // Registrar log de teste
      await logEmail(to, `[TESTE] ${assuntoFinal}`, 'enviado');

      return {
        success: true,
        message: 'E-mail de teste enviado com sucesso via Power Automate'
      };
    } catch (error) {
      console.error('Erro ao enviar e-mail de teste:', error);
      
      // Registrar log de erro
      await logEmail(
        to, 
        `[TESTE] ${assuntoFinal}`, 
        'erro', 
        error instanceof Error ? error.message : 'Erro ao enviar e-mail de teste'
      );
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar e-mail de teste via Power Automate'
      };
    }
  }
};
