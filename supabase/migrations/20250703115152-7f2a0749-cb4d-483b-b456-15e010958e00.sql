-- Criar tabela para regras de precificação
CREATE TABLE public.regras_precificacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ano INTEGER NOT NULL,
  aplicativo_id UUID NOT NULL REFERENCES aplicativos(id),
  calibracao_lu DECIMAL(10,2) NOT NULL,
  lu_meses INTEGER NOT NULL,
  lu_ma_minima DECIMAL(10,2) NOT NULL,
  margem_venda DECIMAL(10,2) NOT NULL,
  receita_mensal DECIMAL(15,2) NOT NULL,
  custo_mensal DECIMAL(15,2) NOT NULL,
  qtd_clientes INTEGER NOT NULL,
  bloco_k_lu DECIMAL(15,2) NOT NULL,
  reinf_lu DECIMAL(15,2) NOT NULL,
  bloco_k_ma DECIMAL(15,2) NOT NULL,
  reinf_ma DECIMAL(15,2) NOT NULL,
  -- Campos calculados
  custo_percent DECIMAL(10,2),
  receita_custo_percent DECIMAL(10,2),
  custo_medio DECIMAL(15,2),
  custo_base DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ano, aplicativo_id)
);

-- Criar tabela para configurações de prefeituras
CREATE TABLE public.config_prefeituras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regra_id UUID NOT NULL REFERENCES regras_precificacao(id) ON DELETE CASCADE,
  quantidade_municipios INTEGER NOT NULL,
  calibracao DECIMAL(10,2),
  sob_consulta BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para configurações SaaS
CREATE TABLE public.config_saas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regra_id UUID NOT NULL REFERENCES regras_precificacao(id) ON DELETE CASCADE,
  plano VARCHAR(10) NOT NULL, -- PP, P, M, MDB, G, GG
  nome_plano VARCHAR(50) NOT NULL,
  volumetria_min INTEGER NOT NULL,
  volumetria_max INTEGER,
  hosting DECIMAL(15,2) NOT NULL,
  devops DECIMAL(15,2) NOT NULL,
  setup DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para configurações de suporte
CREATE TABLE public.config_suporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regra_id UUID NOT NULL REFERENCES regras_precificacao(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  tipo_suporte VARCHAR(100) NOT NULL,
  quantidade_horas DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para configurações VA
CREATE TABLE public.config_va (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regra_id UUID NOT NULL REFERENCES regras_precificacao(id) ON DELETE CASCADE,
  fator DECIMAL(10,2) NOT NULL,
  va INTEGER NOT NULL,
  agregado DECIMAL(10,2) NOT NULL,
  calibracao DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para colunas customizáveis da calibração
CREATE TABLE public.calibracao_colunas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regra_id UUID NOT NULL REFERENCES regras_precificacao(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- 'percentual' ou 'fixo'
  considera_segmento BOOLEAN DEFAULT true,
  regra_calculo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para valores das colunas por segmento
CREATE TABLE public.calibracao_valores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coluna_id UUID NOT NULL REFERENCES calibracao_colunas(id) ON DELETE CASCADE,
  segmento VARCHAR(20) NOT NULL, -- 'industria', 'utilities', 'servico'
  valor DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regras_precificacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_prefeituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_saas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_suporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_va ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibracao_colunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibracao_valores ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can manage regras_precificacao" ON public.regras_precificacao FOR ALL USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Authenticated users can manage config_prefeituras" ON public.config_prefeituras FOR ALL USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Authenticated users can manage config_saas" ON public.config_saas FOR ALL USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Authenticated users can manage config_suporte" ON public.config_suporte FOR ALL USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Authenticated users can manage config_va" ON public.config_va FOR ALL USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Authenticated users can manage calibracao_colunas" ON public.calibracao_colunas FOR ALL USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Authenticated users can manage calibracao_valores" ON public.calibracao_valores FOR ALL USING (auth.role() = 'authenticated'::text);

-- Create triggers for updated_at
CREATE TRIGGER update_regras_precificacao_updated_at
  BEFORE UPDATE ON public.regras_precificacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();