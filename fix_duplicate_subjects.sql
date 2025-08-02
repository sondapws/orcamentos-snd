-- Script para corrigir assuntos duplicados nos templates de e-mail
-- Execute no painel do Supabase (SQL Editor)

-- 1. Verificar templates com possível duplicação
SELECT 
  id,
  nome,
  assunto,
  CASE 
    WHEN LOWER(assunto) LIKE '%seu orçamento%seu orçamento%' THEN 'DUPLICAÇÃO DETECTADA'
    WHEN LOWER(assunto) LIKE '%seu orçamento - seu orçamento%' THEN 'DUPLICAÇÃO DETECTADA'
    ELSE 'OK'
  END as status
FROM public.email_templates 
WHERE ativo = true
ORDER BY nome;

-- 2. Atualizar templates com duplicação comum "Seu Orçamento - Seu Orçamento"
UPDATE public.email_templates 
SET assunto = REPLACE(assunto, 'Seu Orçamento - Seu Orçamento', 'Orçamento Comply')
WHERE LOWER(assunto) LIKE '%seu orçamento - seu orçamento%'
  AND ativo = true;

-- 3. Atualizar templates com duplicação "Seu orçamento - {{razaoSocial}}" para evitar conflito
UPDATE public.email_templates 
SET assunto = REPLACE(assunto, 'Seu Orçamento - {{razaoSocial}}', 'Orçamento Comply - {{razaoSocial}}')
WHERE assunto = 'Seu Orçamento - {{razaoSocial}}'
  AND ativo = true;

-- 4. Verificar resultado após correções
SELECT 
  id,
  nome,
  assunto,
  CASE 
    WHEN LOWER(assunto) LIKE '%seu orçamento%seu orçamento%' THEN 'AINDA TEM DUPLICAÇÃO'
    WHEN LOWER(assunto) LIKE '%orçamento comply%' THEN 'CORRIGIDO'
    ELSE 'OUTROS'
  END as status_pos_correcao
FROM public.email_templates 
WHERE ativo = true
ORDER BY nome;

-- 5. Mostrar estatísticas
SELECT 
  COUNT(*) as total_templates,
  COUNT(CASE WHEN LOWER(assunto) LIKE '%seu orçamento%seu orçamento%' THEN 1 END) as com_duplicacao,
  COUNT(CASE WHEN LOWER(assunto) LIKE '%orçamento comply%' THEN 1 END) as corrigidos
FROM public.email_templates 
WHERE ativo = true;