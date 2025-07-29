-- Script seguro para aplicar migração do sistema de aprovação
-- Este script verifica se as tabelas e políticas já existem antes de criar

-- Verificar se as tabelas existem e criar apenas se necessário
DO $$
BEGIN
    -- Criar tabela pending_quotes se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pending_quotes') THEN
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
        
        -- Habilitar RLS
        ALTER TABLE public.pending_quotes ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela pending_quotes criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela pending_quotes já existe';
    END IF;

    -- Criar tabela approval_notifications se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'approval_notifications') THEN
        CREATE TABLE public.approval_notifications (
            id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            type text NOT NULL CHECK (type IN ('new_quote_pending', 'quote_approved', 'quote_rejected')),
            message text NOT NULL,
            quote_id uuid NOT NULL REFERENCES public.pending_quotes(id) ON DELETE CASCADE,
            read boolean NOT NULL DEFAULT false,
            created_at timestamp with time zone DEFAULT now()
        );
        
        -- Habilitar RLS
        ALTER TABLE public.approval_notifications ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela approval_notifications criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela approval_notifications já existe';
    END IF;

    -- Criar tabela approval_settings se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'approval_settings') THEN
        CREATE TABLE public.approval_settings (
            id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            email_notifications boolean NOT NULL DEFAULT true,
            approver_email text NOT NULL DEFAULT 'admin@sonda.com',
            auto_approval_domains text[] NOT NULL DEFAULT ARRAY['sonda.com'],
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        -- Habilitar RLS
        ALTER TABLE public.approval_settings ENABLE ROW LEVEL SECURITY;
        
        -- Inserir configuração padrão
        INSERT INTO public.approval_settings (email_notifications, approver_email, auto_approval_domains)
        VALUES (true, 'admin@sonda.com', ARRAY['sonda.com']);
        
        RAISE NOTICE 'Tabela approval_settings criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela approval_settings já existe';
    END IF;
END
$$;

-- Criar políticas RLS de forma segura
DO $$
BEGIN
    -- Políticas para pending_quotes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pending_quotes' AND policyname = 'Anyone can insert pending quotes') THEN
        CREATE POLICY "Anyone can insert pending quotes" 
            ON public.pending_quotes 
            FOR INSERT 
            WITH CHECK (true);
        RAISE NOTICE 'Política de inserção para pending_quotes criada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pending_quotes' AND policyname = 'Anyone can view pending quotes') THEN
        CREATE POLICY "Anyone can view pending quotes" 
            ON public.pending_quotes 
            FOR SELECT 
            USING (true);
        RAISE NOTICE 'Política de visualização para pending_quotes criada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pending_quotes' AND policyname = 'Anyone can update pending quotes') THEN
        CREATE POLICY "Anyone can update pending quotes" 
            ON public.pending_quotes 
            FOR UPDATE 
            USING (true);
        RAISE NOTICE 'Política de atualização para pending_quotes criada';
    END IF;

    -- Políticas para approval_notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'approval_notifications' AND policyname = 'Anyone can view notifications') THEN
        CREATE POLICY "Anyone can view notifications" 
            ON public.approval_notifications 
            FOR SELECT 
            USING (true);
        RAISE NOTICE 'Política de visualização para approval_notifications criada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'approval_notifications' AND policyname = 'Anyone can insert notifications') THEN
        CREATE POLICY "Anyone can insert notifications" 
            ON public.approval_notifications 
            FOR INSERT 
            WITH CHECK (true);
        RAISE NOTICE 'Política de inserção para approval_notifications criada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'approval_notifications' AND policyname = 'Anyone can update notifications') THEN
        CREATE POLICY "Anyone can update notifications" 
            ON public.approval_notifications 
            FOR UPDATE 
            USING (true);
        RAISE NOTICE 'Política de atualização para approval_notifications criada';
    END IF;

    -- Políticas para approval_settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'approval_settings' AND policyname = 'Anyone can view settings') THEN
        CREATE POLICY "Anyone can view settings" 
            ON public.approval_settings 
            FOR SELECT 
            USING (true);
        RAISE NOTICE 'Política de visualização para approval_settings criada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'approval_settings' AND policyname = 'Anyone can update settings') THEN
        CREATE POLICY "Anyone can update settings" 
            ON public.approval_settings 
            FOR UPDATE 
            USING (true);
        RAISE NOTICE 'Política de atualização para approval_settings criada';
    END IF;
END
$$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_pending_quotes_status ON public.pending_quotes(status);
CREATE INDEX IF NOT EXISTS idx_pending_quotes_submitted_at ON public.pending_quotes(submitted_at);
CREATE INDEX IF NOT EXISTS idx_pending_quotes_product_type ON public.pending_quotes(product_type);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_read ON public.approval_notifications(read);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_created_at ON public.approval_notifications(created_at);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Criar triggers se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_pending_quotes_updated_at') THEN
        CREATE TRIGGER update_pending_quotes_updated_at
            BEFORE UPDATE ON public.pending_quotes
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        RAISE NOTICE 'Trigger para pending_quotes criado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_approval_settings_updated_at') THEN
        CREATE TRIGGER update_approval_settings_updated_at
            BEFORE UPDATE ON public.approval_settings
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        RAISE NOTICE 'Trigger para approval_settings criado';
    END IF;
END
$$;

-- Verificar se tudo foi criado corretamente
SELECT 
    'pending_quotes' as tabela,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pending_quotes') 
         THEN 'Existe' ELSE 'Não existe' END as status
UNION ALL
SELECT 
    'approval_notifications' as tabela,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'approval_notifications') 
         THEN 'Existe' ELSE 'Não existe' END as status
UNION ALL
SELECT 
    'approval_settings' as tabela,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'approval_settings') 
         THEN 'Existe' ELSE 'Não existe' END as status;

-- Mostrar configuração atual
SELECT * FROM public.approval_settings LIMIT 1;