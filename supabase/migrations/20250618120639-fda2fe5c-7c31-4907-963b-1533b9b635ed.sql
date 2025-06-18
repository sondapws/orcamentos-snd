
-- Criar tabela para configurações SMTP
CREATE TABLE public.email_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  servidor text NOT NULL,
  porta integer NOT NULL,
  usuario text NOT NULL,
  senha text NOT NULL,
  ssl boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para templates de e-mail
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL DEFAULT 'template_orcamento',
  assunto text NOT NULL,
  corpo text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para email_config (apenas usuários autenticados podem acessar)
CREATE POLICY "Authenticated users can view email config" 
  ON public.email_config 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert email config" 
  ON public.email_config 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update email config" 
  ON public.email_config 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete email config" 
  ON public.email_config 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Políticas para email_templates (apenas usuários autenticados podem acessar)
CREATE POLICY "Authenticated users can view email templates" 
  ON public.email_templates 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert email templates" 
  ON public.email_templates 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update email templates" 
  ON public.email_templates 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete email templates" 
  ON public.email_templates 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Inserir configuração SMTP padrão
INSERT INTO public.email_config (servidor, porta, usuario, senha, ssl)
VALUES ('smtp.office365.com', 587, '', '', true);

-- Inserir template padrão
INSERT INTO public.email_templates (nome, assunto, corpo)
VALUES (
  'template_orcamento',
  'Seu Orçamento - {{razaoSocial}}',
  'Prezado(a) {{responsavel}},

Segue em anexo o orçamento solicitado para {{razaoSocial}}.

Detalhes do orçamento:
- Empresa: {{razaoSocial}}
- CNPJ: {{cnpj}}
- Segmento: {{segmento}}
- Modalidade: {{modalidade}}
- Valor: {{valor}}

Atenciosamente,
Equipe Comercial'
);
