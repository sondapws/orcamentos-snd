
import { EmailRequest } from './types.ts'

export const validateEmailRequest = (body: any): { valid: boolean; error?: string; data?: EmailRequest } => {
  const { to, subject, html, attachments } = body

  if (!to || !subject || !html) {
    return {
      valid: false,
      error: 'Campos obrigatórios: to, subject, html'
    }
  }

  return {
    valid: true,
    data: { to, subject, html, attachments }
  }
}
