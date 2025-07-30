-- Migração para Sistema de Aprovação
-- Arquivo: supabase/migrations/001_approval_system.sql

-- Criar tabela para orçamentos pendentes de aprovação
CREATE TABLE IF NOT EXISTS public.pending_quotes (
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
CREATE TABLE IF NOT EXISTS public.approval_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('new_quote_pending', 'quote_approved', 'quote_rejected')),
  message text NOT NULL,
  quote_id uuid NOT NULL REFERENCES public.pending_quotes(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para configurações de aprovação
CREATE TABLE IF NOT EXISTS public.approval_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_notifications boolean NOT NULL DEFAULT true,
  approver_email text NOT NULL DEFAULT 'admin@sonda.com',
  auto_approval_domains text[] NOT NULL DEFAULT ARRAY['sonda.com'],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir configuração padrão se não existir
INSERT INTO public.approval_settings (email_notifications, approver_email, auto_approval_domains)
SELECT true, 'admin@sonda.com', ARRAY['sonda.com']
WHERE NOT EXISTS (SELECT 1 FROM public.approval_settings);

-- Habilitar RLS nas tabelas
ALTER TABLE public.pending_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para pending_quotes
CREATE POLICY IF NOT EXISTS "Anyone can view pending quotes" 
  ON public.pending_quotes 
  FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert pending quotes" 
  ON public.pending_quotes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can update pending quotes" 
  ON public.pending_quotes 
  FOR UPDATE 
  USING (true);

-- Políticas para approval_notifications
CREATE POLICY IF NOT EXISTS "Anyone can view notifications" 
  ON public.approval_notifications 
  FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert notifications" 
  ON public.approval_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can update notifications" 
  ON public.approval_notifications 
  FOR UPDATE 
  USING (true);

-- Políticas para approval_settings
CREATE POLICY IF NOT EXISTS "Anyone can view settings" 
  ON public.approval_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can update settings" 
  ON public.approval_settings 
  FOR UPDATE 
  USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pending_quotes_status ON public.pending_quotes(status);
CREATE INDEX IF NOT EXISTS idx_pending_quotes_submitted_at ON public.pending_quotes(submitted_at);
CREATE INDEX IF NOT EXISTS idx_pending_quotes_product_type ON public.pending_quotes(product_type);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_read ON public.approval_notifications(read);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_created_at ON public.approval_notifications(created_at);

-- Índice composto para otimizar consultas de duplicatas
CREATE INDEX IF NOT EXISTS idx_pending_quotes_cnpj_product_status 
ON public.pending_quotes USING btree (
    ((form_data->>'cnpj')), 
    product_type, 
    status
) WHERE status = 'pending';

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
DROP TRIGGER IF EXISTS update_pending_quotes_updated_at ON public.pending_quotes;
CREATE TRIGGER update_pending_quotes_updated_at
  BEFORE UPDATE ON public.pending_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_approval_settings_updated_at ON public.approval_settings;
CREATE TRIGGER update_approval_settings_updated_at
  BEFORE UPDATE ON public.approval_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para limpeza automática de dados antigos (mais de 31 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.approval_notifications 
    WHERE created_at < (now() - interval '31 days');
    
    DELETE FROM public.pending_quotes 
    WHERE status IN ('approved', 'rejected') 
    AND updated_at < (now() - interval '31 days');
    
    RAISE NOTICE 'Limpeza de dados antigos concluída';
END;
$$;