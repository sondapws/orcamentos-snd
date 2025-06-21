
-- Criar tabela para aplicativos/produtos
CREATE TABLE public.aplicativos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para dados principais de produtos por ano
CREATE TABLE public.dados_produto_ano (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aplicativo_id uuid NOT NULL REFERENCES public.aplicativos(id) ON DELETE CASCADE,
  ano integer NOT NULL,
  calibracao_lu numeric(10,2) NOT NULL DEFAULT 80.00,
  lu_meses integer NOT NULL DEFAULT 12,
  lu_ma_minima numeric(10,2) NOT NULL DEFAULT 30.00,
  margem_venda numeric(10,2) NOT NULL DEFAULT 38.65,
  -- Campos calculados (somente leitura)
  custo_percent numeric(10,2) GENERATED ALWAYS AS (100 - margem_venda) STORED,
  receita_mensal numeric(15,2) DEFAULT 0,
  custo_mensal numeric(15,2) DEFAULT 0,
  receita_custo numeric(15,2) DEFAULT 0,
  qtd_clientes integer DEFAULT 0,
  custo_medio numeric(15,2) DEFAULT 0,
  custo_base numeric(15,2) DEFAULT 0,
  bloco_k_lu numeric(15,2) DEFAULT 0,
  reinf_lu numeric(15,2) DEFAULT 0,
  bloco_k_ma numeric(15,2) DEFAULT 0,
  reinf_ma numeric(15,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(aplicativo_id, ano)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.aplicativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_produto_ano ENABLE ROW LEVEL SECURITY;

-- Políticas para aplicativos (apenas usuários autenticados podem acessar)
CREATE POLICY "Authenticated users can view aplicativos" 
  ON public.aplicativos 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert aplicativos" 
  ON public.aplicativos 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update aplicativos" 
  ON public.aplicativos 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete aplicativos" 
  ON public.aplicativos 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Políticas para dados_produto_ano
CREATE POLICY "Authenticated users can view dados_produto_ano" 
  ON public.dados_produto_ano 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert dados_produto_ano" 
  ON public.dados_produto_ano 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update dados_produto_ano" 
  ON public.dados_produto_ano 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete dados_produto_ano" 
  ON public.dados_produto_ano 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Índices para melhor performance
CREATE INDEX idx_aplicativos_ativo ON public.aplicativos(ativo);
CREATE INDEX idx_dados_produto_ano_aplicativo ON public.dados_produto_ano(aplicativo_id);
CREATE INDEX idx_dados_produto_ano_ano ON public.dados_produto_ano(ano);
