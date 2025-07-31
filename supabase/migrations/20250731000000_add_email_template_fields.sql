-- Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar campos necessários à tabela email_templates
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS descricao text,
ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'orcamento',
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS vinculado_formulario boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS formulario text,
ADD COLUMN IF NOT EXISTS modalidade text;

-- Atualizar templates existentes para serem vinculados ao formulário
UPDATE public.email_templates 
SET vinculado_formulario = true 
WHERE vinculado_formulario IS NULL OR vinculado_formulario = false;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_email_templates_ativo ON public.email_templates(ativo);
CREATE INDEX IF NOT EXISTS idx_email_templates_vinculado ON public.email_templates(vinculado_formulario);
CREATE INDEX IF NOT EXISTS idx_email_templates_tipo ON public.email_templates(tipo);
CREATE INDEX IF NOT EXISTS idx_email_templates_formulario ON public.email_templates(formulario);
CREATE INDEX IF NOT EXISTS idx_email_templates_modalidade ON public.email_templates(modalidade);

-- Trigger para atualizar updated_at (criar apenas se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_email_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_email_templates_updated_at
      BEFORE UPDATE ON public.email_templates
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;