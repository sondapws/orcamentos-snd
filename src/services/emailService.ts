
import { supabase } from '@/integrations/supabase/client';

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

export const emailService = {
  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        return {
          success: false,
          error: error.message || 'Erro ao enviar email'
        };
      }

      return data;
    } catch (error) {
      console.error('Erro ao chamar serviço de email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
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

    // Converter quebras de linha para HTML
    const htmlContent = corpoFinal.replace(/\n/g, '<br>');

    return this.sendEmail({
      to,
      subject: assuntoFinal,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              ${htmlContent}
            </div>
          </body>
        </html>
      `
    });
  }
};
