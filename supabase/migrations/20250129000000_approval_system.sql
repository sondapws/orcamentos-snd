-- Criar tabela para orçamentos pendentes de aprovação
CREATE TABLE public.pending_quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_data jsonb NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('comply_edocs', 'comply_fiscal')),
  submitted_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by text,
  approved_at timestamp with time zone,
  rejected_by text,
  rejected_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para notificações de aprovação
CREATE TABLE public.approval_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('new_quote_pending', 'quote_approved', 'quote_rejected')),
  message text NOT NULL,
  quote_id uuid NOT NULL REFERENCES public.pending_quotes(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para configurações de aprovação
CREATE TABLE public.approval_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_notifications boolean NOT NULL DEFAULT true,
  approver_email text NOT NULL DEFAULT 'admin@sonda.com',
  auto_approval_domains text[] NOT NULL DEFAULT ARRAY['sonda.com'],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.approval_settings (email_notifications, approver_email, auto_approval_domains)
VALUES (true, 'admin@sonda.com', ARRAY['sonda.com']);

-- Habilitar RLS nas tabelas
ALTER TABLE public.pending_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para pending_quotes
CREATE POLICY "Authenticated users can view pending quotes" 
  ON public.pending_quotes 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert pending quotes" 
  ON public.pending_quotes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pending quotes" 
  ON public.pending_quotes 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Políticas para approval_notifications
CREATE POLICY "Authenticated users can view notifications" 
  ON public.approval_notifications 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert notifications" 
  ON public.approval_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications" 
  ON public.approval_notifications 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Políticas para approval_settings
CREATE POLICY "Authenticated users can view settings" 
  ON public.approval_settings 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update settings" 
  ON public.approval_settings 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Índices para melhor performance
CREATE INDEX idx_pending_quotes_status ON public.pending_quotes(status);
CREATE INDEX idx_pending_quotes_submitted_at ON public.pending_quotes(submitted_at);
CREATE INDEX idx_pending_quotes_product_type ON public.pending_quotes(product_type);
CREATE INDEX idx_approval_notifications_read ON public.approval_notifications(read);
CREATE INDEX idx_approval_notifications_created_at ON public.approval_notifications(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_pending_quotes_updated_at
  BEFORE UPDATE ON public.pending_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_approval_settings_updated_at
  BEFORE UPDATE ON public.approval_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();