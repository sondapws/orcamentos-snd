
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
import { EmailConfig, EmailRequest } from './types.ts'

export const sendEmailViaSMTP = async (
  config: EmailConfig,
  emailData: EmailRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = new SMTPClient({
      connection: {
        hostname: config.servidor,
        port: config.porta,
        tls: config.ssl,
        auth: {
          username: config.usuario,
          password: config.senha,
        },
      },
    })

    console.log('Conectando ao servidor SMTP...')

    await client.send({
      from: config.usuario,
      to: emailData.to,
      subject: emailData.subject,
      content: emailData.html,
      html: emailData.html,
    })

    await client.close()

    console.log('E-mail enviado com sucesso via SMTP')
    return { success: true }

  } catch (smtpError) {
    console.error('Erro no envio SMTP:', smtpError)
    
    let errorMessage = 'Erro desconhecido no envio SMTP'
    
    if (smtpError.message.includes('authentication')) {
      errorMessage = 'Erro de autenticação SMTP. Verifique usuário e senha.'
    } else if (smtpError.message.includes('connection')) {
      errorMessage = 'Erro de conexão SMTP. Verifique servidor e porta.'
    } else if (smtpError.message.includes('timeout')) {
      errorMessage = 'Timeout na conexão SMTP. Tente novamente.'
    } else if (smtpError.message.includes('recipient')) {
      errorMessage = 'Endereço de destinatário inválido.'
    } else {
      errorMessage = `Erro SMTP: ${smtpError.message}`
    }
    
    return { success: false, error: errorMessage }
  }
}
