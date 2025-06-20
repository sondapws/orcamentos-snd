
-- Criar tabela para logs de envio de e-mail
CREATE TABLE public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destinatario text NOT NULL,
  assunto text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  erro text,
  enviado_em timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para email_logs (apenas usuários autenticados podem acessar)
CREATE POLICY "Authenticated users can view email logs" 
  ON public.email_logs 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert email logs" 
  ON public.email_logs 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Índices para melhor performance
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_enviado_em ON public.email_logs(enviado_em);
