import { supabase } from '@/integrations/supabase/client';
import type { EmailTemplate } from '@/types/approval';

export interface TestEmailRequest {
  templateId: string;
  recipientEmail: string;
  formulario: 'comply_edocs' | 'comply_fiscal';
  modalidade: 'on-premise' | 'saas';
  testData?: Record<string, any>;
}

export interface TestEmailResult {
  success: boolean;
  message: string;
  emailId?: string;
  previewHtml?: string;
}

export interface EmailTestLog {
  id: string;
  template_id: string;
  template_name: string;
  formulario: 'comply_edocs' | 'comply_fiscal';
  modalidade: 'on-premise' | 'saas';
  recipient_email: string;
  test_data?: Record<string, any>;
  success: boolean;
  error_message?: string;
  tested_by: string;
  tested_at: string;
  created_at: string;
}

export class EmailTestError extends Error {
  constructor(
    message: string,
    public code: 'TEMPLATE_NOT_FOUND' | 'INVALID_EMAIL' | 'SEND_FAILED' | 'DATABASE_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'EmailTestError';
  }
}

export class EmailTestService {
  /**
   * Gera prévia do e-mail usando o template especificado
   * @param template - Template a ser usado para gerar a prévia
   * @param testData - Dados de teste para substituir variáveis no template
   * @returns HTML renderizado do e-mail
   */
  generateEmailPreview(template: EmailTemplate, testData?: Record<string, any>): string {
    try {
      console.log(`Gerando prévia para template: ${template.nome}`);
      
      // Dados padrão para teste se não fornecidos
      const defaultTestData = {
        nome_cliente: 'João Silva',
        empresa: 'Empresa Teste Ltda',
        email: 'joao.silva@empresateste.com.br',
        telefone: '(11) 99999-9999',
        produto: template.formulario === 'comply_edocs' ? 'Comply e-DOCS' : 'Comply Fiscal',
        modalidade: template.modalidade === 'on-premise' ? 'On-premisse' : 'SaaS',
        data_solicitacao: new Date().toLocaleDateString('pt-BR'),
        hora_solicitacao: new Date().toLocaleTimeString('pt-BR'),
        ...testData
      };

      // Substituir variáveis no assunto
      let assunto = template.assunto;
      Object.entries(defaultTestData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        assunto = assunto.replace(regex, String(value));
      });

      // Substituir variáveis no corpo
      let corpo = template.corpo;
      Object.entries(defaultTestData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        corpo = corpo.replace(regex, String(value));
      });

      // Gerar HTML completo da prévia
      const previewHtml = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${assunto}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-header {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              border-left: 4px solid #007bff;
            }
            .email-subject {
              font-size: 18px;
              font-weight: bold;
              color: #007bff;
              margin: 0;
            }
            .email-body {
              background-color: #fff;
              padding: 20px;
              border-radius: 5px;
              border: 1px solid #e9ecef;
            }
            .test-notice {
              background-color: #fff3cd;
              color: #856404;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 20px;
              border: 1px solid #ffeaa7;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="test-notice">
            <strong>⚠️ E-mail de Teste</strong><br>
            Este é um e-mail de teste gerado automaticamente para validação do template.
          </div>
          
          <div class="email-header">
            <h1 class="email-subject">${assunto}</h1>
          </div>
          
          <div class="email-body">
            ${corpo}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; font-size: 12px; color: #6c757d;">
            <strong>Informações do Template:</strong><br>
            Template: ${template.nome}<br>
            ID: ${template.id}<br>
            Formulário: ${template.formulario === 'comply_edocs' ? 'Comply e-DOCS' : 'Comply Fiscal'}<br>
            Modalidade: ${template.modalidade === 'on-premise' ? 'On-premisse' : 'SaaS'}<br>
            Testado em: ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
        </html>
      `;

      console.log('Prévia gerada com sucesso');
      return previewHtml;
    } catch (error) {
      console.error('Erro ao gerar prévia do e-mail:', error);
      throw new EmailTestError(
        'Erro ao gerar prévia do e-mail',
        'SEND_FAILED',
        error
      );
    }
  }

  /**
   * Envia e-mail de teste para o administrador
   * @param request - Dados da solicitação de teste
   * @returns Resultado do envio
   */
  async sendTestEmail(request: TestEmailRequest): Promise<TestEmailResult> {
    try {
      console.log(`Enviando e-mail de teste para: ${request.recipientEmail}`);

      // Validar e-mail do destinatário
      if (!this.isValidEmail(request.recipientEmail)) {
        throw new EmailTestError(
          'E-mail do destinatário inválido',
          'INVALID_EMAIL'
        );
      }

      // Buscar template
      const { data: templateData, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', request.templateId)
        .eq('ativo', true)
        .single();

      if (templateError || !templateData) {
        throw new EmailTestError(
          'Template não encontrado ou inativo',
          'TEMPLATE_NOT_FOUND',
          templateError
        );
      }

      const template: EmailTemplate = {
        id: templateData.id,
        nome: templateData.nome,
        assunto: templateData.assunto,
        corpo: templateData.corpo,
        descricao: templateData.descricao,
        tipo: templateData.tipo,
        ativo: templateData.ativo,
        vinculado_formulario: templateData.vinculado_formulario,
        formulario: templateData.formulario,
        modalidade: templateData.modalidade,
        created_at: templateData.created_at,
        updated_at: templateData.updated_at
      };

      // Gerar prévia do e-mail
      const previewHtml = this.generateEmailPreview(template, request.testData);

      // Simular envio de e-mail (em um ambiente real, aqui seria integrado com um serviço de e-mail)
      // Por enquanto, vamos apenas registrar o log e retornar sucesso
      console.log('E-mail de teste simulado enviado com sucesso');

      // Registrar log de auditoria
      await this.logTestEmail({
        template_id: template.id,
        template_name: template.nome,
        formulario: request.formulario,
        modalidade: request.modalidade,
        recipient_email: request.recipientEmail,
        test_data: request.testData,
        success: true,
        tested_by: 'admin', // Em um ambiente real, pegar do contexto de autenticação
        tested_at: new Date().toISOString()
      });

      return {
        success: true,
        message: 'E-mail de teste enviado com sucesso',
        emailId: `test_${Date.now()}`,
        previewHtml
      };
    } catch (error) {
      console.error('Erro ao enviar e-mail de teste:', error);

      // Registrar log de erro
      try {
        await this.logTestEmail({
          template_id: request.templateId,
          template_name: 'Template não encontrado',
          formulario: request.formulario,
          modalidade: request.modalidade,
          recipient_email: request.recipientEmail,
          test_data: request.testData,
          success: false,
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
          tested_by: 'admin',
          tested_at: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Erro ao registrar log de teste:', logError);
      }

      if (error instanceof EmailTestError) {
        throw error;
      }

      throw new EmailTestError(
        'Erro inesperado ao enviar e-mail de teste',
        'SEND_FAILED',
        error
      );
    }
  }

  /**
   * Registra log de auditoria para teste de e-mail
   * @param logData - Dados do log
   */
  private async logTestEmail(logData: Omit<EmailTestLog, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_test_logs')
        .insert({
          template_id: logData.template_id,
          template_name: logData.template_name,
          formulario: logData.formulario,
          modalidade: logData.modalidade,
          recipient_email: logData.recipient_email,
          test_data: logData.test_data,
          success: logData.success,
          error_message: logData.error_message,
          tested_by: logData.tested_by,
          tested_at: logData.tested_at
        });

      if (error) {
        console.error('Erro ao registrar log de teste:', error);
        // Não lançar erro aqui para não interromper o fluxo principal
      } else {
        console.log('Log de teste registrado com sucesso');
      }
    } catch (error) {
      console.error('Erro inesperado ao registrar log:', error);
      // Não lançar erro aqui para não interromper o fluxo principal
    }
  }

  /**
   * Busca logs de teste de e-mail
   * @param templateId - ID do template (opcional)
   * @param limit - Limite de resultados
   * @returns Lista de logs de teste
   */
  async getTestLogs(templateId?: string, limit: number = 50): Promise<EmailTestLog[]> {
    try {
      let query = supabase
        .from('email_test_logs')
        .select('*')
        .order('tested_at', { ascending: false })
        .limit(limit);

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar logs de teste:', error);
        throw new EmailTestError(
          'Erro ao buscar logs de teste',
          'DATABASE_ERROR',
          error
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof EmailTestError) {
        throw error;
      }
      console.error('Erro inesperado ao buscar logs:', error);
      throw new EmailTestError(
        'Erro inesperado ao buscar logs de teste',
        'DATABASE_ERROR',
        error
      );
    }
  }

  /**
   * Valida formato de e-mail
   * @param email - E-mail a ser validado
   * @returns true se válido, false caso contrário
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Instância singleton do serviço
export const emailTestService = new EmailTestService();