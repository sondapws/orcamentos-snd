-- Script para debug da tabela pending_quotes
-- Execute no painel do Supabase para verificar os dados

-- 1. Verificar todos os orçamentos pendentes
SELECT 
  id,
  form_data->>'cnpj' as cnpj,
  form_data->>'razaoSocial' as razao_social,
  form_data->>'email' as email,
  product_type,
  status,
  submitted_at,
  created_at
FROM pending_quotes 
WHERE status = 'pending'
ORDER BY submitted_at DESC;

-- 2. Contar orçamentos por CNPJ e produto
SELECT 
  form_data->>'cnpj' as cnpj,
  product_type,
  COUNT(*) as quantidade
FROM pending_quotes 
WHERE status = 'pending'
GROUP BY form_data->>'cnpj', product_type
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 3. Verificar se há orçamentos duplicados (mesmo CNPJ, produto e data próxima)
SELECT 
  p1.id as id1,
  p2.id as id2,
  p1.form_data->>'cnpj' as cnpj,
  p1.product_type,
  p1.submitted_at as data1,
  p2.submitted_at as data2,
  EXTRACT(EPOCH FROM (p2.submitted_at - p1.submitted_at))/60 as diferenca_minutos
FROM pending_quotes p1
JOIN pending_quotes p2 ON 
  p1.form_data->>'cnpj' = p2.form_data->>'cnpj' 
  AND p1.product_type = p2.product_type
  AND p1.id < p2.id
  AND p1.status = 'pending'
  AND p2.status = 'pending'
  AND ABS(EXTRACT(EPOCH FROM (p2.submitted_at - p1.submitted_at))) < 3600 -- menos de 1 hora de diferença
ORDER BY p1.submitted_at DESC;

-- 4. Total de orçamentos pendentes
SELECT 
  product_type,
  COUNT(*) as total
FROM pending_quotes 
WHERE status = 'pending'
GROUP BY product_type;