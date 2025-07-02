-- Criar tabela para configuração do webhook do Power Automate
CREATE TABLE public.webhook_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_url text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.webhook_config ENABLE ROW LEVEL SECURITY;

-- Políticas para webhook_config (apenas usuários autenticados podem acessar)
CREATE POLICY "Authenticated users can view webhook config" 
  ON public.webhook_config 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert webhook config" 
  ON public.webhook_config 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update webhook config" 
  ON public.webhook_config 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webhook_config_updated_at
  BEFORE UPDATE ON public.webhook_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();