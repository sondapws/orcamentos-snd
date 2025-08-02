-- Migração para adicionar templates padrão para todas as combinações
-- Arquivo: supabase/migrations/20250802000000_add_default_templates.sql

-- Inserir template padrão para Comply e-DOCS
INSERT INTO public.email_templates (nome, assunto, corpo, ativo)
VALUES (
  'template_comply_edocs_default',
  'Orçamento Comply e-DOCS - {{razaoSocial}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Orçamento Comply e-DOCS</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Soluções em Documentos Eletrônicos</p>
    </div>
    
    <div style="padding: 30px; background: #f8fafc;">
      <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
        Olá <strong>{{responsavel}}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
        Seu orçamento para Comply e-DOCS foi aprovado e processado com sucesso! Segue abaixo os dados da sua solicitação:
      </p>
      
      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
        <h3 style="color: #2563eb; margin-top: 0;">Dados da Solicitação</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong> {{razaoSocial}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>CNPJ:</strong> {{cnpj}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Responsável:</strong> {{responsavel}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>E-mail:</strong> {{email}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Segmento:</strong> {{segmento}}</li>
          <li style="padding: 8px 0;"><strong>Modalidade:</strong> {{modalidade}}</li>
        </ul>
      </div>
      
      <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <p style="margin: 0; color: #1e40af; font-weight: 500;">
          📧 Em breve nossa equipe comercial entrará em contato para apresentar sua proposta personalizada para Comply e-DOCS.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Atenciosamente,<br>
        <strong>Equipe Sonda</strong>
      </p>
    </div>
    
    <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px;">
      <p style="margin: 0;">© 2024 Sonda - Soluções em Tecnologia</p>
    </div>
  </div>',
  true
) ON CONFLICT DO NOTHING;

-- Inserir mapeamento para comply_edocs + on-premise
INSERT INTO public.email_template_mappings (formulario, modalidade, template_id, ativo)
SELECT 
  'comply_edocs',
  'on-premise',
  t.id,
  true
FROM public.email_templates t
WHERE t.nome = 'template_comply_edocs_default'
ON CONFLICT (formulario, modalidade) DO UPDATE SET
  template_id = EXCLUDED.template_id,
  ativo = true,
  updated_at = now();

-- Inserir mapeamento para comply_edocs + saas (caso não exista)
INSERT INTO public.email_template_mappings (formulario, modalidade, template_id, ativo)
SELECT 
  'comply_edocs',
  'saas',
  t.id,
  true
FROM public.email_templates t
WHERE t.nome = 'template_comply_edocs_default'
ON CONFLICT (formulario, modalidade) DO UPDATE SET
  template_id = EXCLUDED.template_id,
  ativo = true,
  updated_at = now();

-- Verificar se existe template para comply_fiscal, se não, criar um
INSERT INTO public.email_templates (nome, assunto, corpo, ativo)
VALUES (
  'template_comply_fiscal_default',
  'Orçamento Comply Fiscal - {{razaoSocial}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Orçamento Comply Fiscal</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Soluções Fiscais Completas</p>
    </div>
    
    <div style="padding: 30px; background: #f8fafc;">
      <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
        Olá <strong>{{responsavel}}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
        Seu orçamento para Comply Fiscal foi aprovado e processado com sucesso! Segue abaixo os dados da sua solicitação:
      </p>
      
      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #059669;">
        <h3 style="color: #059669; margin-top: 0;">Dados da Solicitação</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong> {{razaoSocial}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>CNPJ:</strong> {{cnpj}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Responsável:</strong> {{responsavel}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>E-mail:</strong> {{email}}</li>
          <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Segmento:</strong> {{segmento}}</li>
          <li style="padding: 8px 0;"><strong>Modalidade:</strong> {{modalidade}}</li>
        </ul>
      </div>
      
      <div style="background: #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <p style="margin: 0; color: #047857; font-weight: 500;">
          📧 Em breve nossa equipe comercial entrará em contato para apresentar sua proposta personalizada para Comply Fiscal.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Atenciosamente,<br>
        <strong>Equipe Sonda</strong>
      </p>
    </div>
    
    <div style="background: #374151; color: white; padding: 20px; text-align: center; font-size: 14px;">
      <p style="margin: 0;">© 2024 Sonda - Soluções em Tecnologia</p>
    </div>
  </div>',
  true
) ON CONFLICT DO NOTHING;

-- Inserir mapeamentos para comply_fiscal (caso não existam)
INSERT INTO public.email_template_mappings (formulario, modalidade, template_id, ativo)
SELECT 
  'comply_fiscal',
  'on-premise',
  t.id,
  true
FROM public.email_templates t
WHERE t.nome = 'template_comply_fiscal_default'
ON CONFLICT (formulario, modalidade) DO UPDATE SET
  template_id = EXCLUDED.template_id,
  ativo = true,
  updated_at = now();

INSERT INTO public.email_template_mappings (formulario, modalidade, template_id, ativo)
SELECT 
  'comply_fiscal',
  'saas',
  t.id,
  true
FROM public.email_templates t
WHERE t.nome = 'template_comply_fiscal_default'
ON CONFLICT (formulario, modalidade) DO UPDATE SET
  template_id = EXCLUDED.template_id,
  ativo = true,
  updated_at = now();