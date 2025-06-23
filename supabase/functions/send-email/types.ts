
export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface EmailConfig {
  servidor: string;
  porta: number;
  usuario: string;
  senha: string;
  ssl: boolean;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}
