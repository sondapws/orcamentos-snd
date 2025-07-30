export { municipiosCompletos as municipiosPorEstado } from './municipiosBrasil';

export const estadosBrasil = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];


export const segmentosEmpresa = [
  { value: 'industria', label: 'Indústria, Varejo ou Outros' },
  { value: 'utilities', label: 'Utilities (Serviços Públicos - Energia, Água, Gás, Saneamento)' },
  { value: 'servico', label: 'Serviço' }
];

export const escopoInboundOptions = [
  { value: 'nfe', label: 'NF-e (Nota Fiscal Eletrônica)' },
  { value: 'nfse', label: 'NFS-e (Nota Fiscal de Serviço Eletrônica)' },
  { value: 'cte', label: 'CT-e (Conhecimento de Transporte Eletrônico) / CT-e OS' },
  { value: 'faturas', label: 'Faturas de Concessionárias' },
  { value: 'nfcom', label: 'NFCom (NF de Serviço de Comunicação)' },
  { value: 'mdfe', label: 'MDF-e (Manifesto Eletrônico de Documentos Fiscais)' },
  { value: 'nfce', label: 'NFC-e (Nota Fiscal de Consumidor Eletrônica)' },
  { value: 'nfe3e', label: 'NFE3e (NF de Serviço de Energia Elétrica)' }
];

export const escopoOutboundOptions = [
  { value: 'nfe', label: 'NF-e (Nota Fiscal Eletrônica)' },
  { value: 'nfse', label: 'NFS-e (Nota Fiscal de Serviço Eletrônica)' },
  { value: 'cte', label: 'CT-e (Conhecimento de Transporte Eletrônico) / CT-e OS' },
  { value: 'nfcom', label: 'NFCom (NF de Serviço de Comunicação)' },
  { value: 'mdfe', label: 'MDF-e (Manifesto Eletrônico de Documentos Fiscais)' },
  { value: 'nfce', label: 'NFC-e (Nota Fiscal de Consumidor Eletrônica)' },
  { value: 'nfe3e', label: 'NFE3e (NF de Serviço de Energia Elétrica)' }
];

export const modelosNotasOptions = [
  { value: 'nfe', label: 'NF-e' },
  { value: 'cte', label: 'CT-e/CT-e OS' },
  { value: 'nfse', label: 'NFS-e' },
  { value: 'faturas', label: 'Faturas de Concessionárias' }
];

export const cenariosNegocioOptions = [
  { value: 'industrializacao', label: 'Industrialização' },
  { value: 'consumo', label: 'Consumo' },
  { value: 'ativo_imobilizado', label: 'Ativo Imobilizado' },
  { value: 'frete', label: 'Frete' },
  { value: 'servicos', label: 'Serviços' }
];

export const volumetriaOptions = [
  { value: 'ate_7000', label: 'Até 7.000' },
  { value: 'ate_20000', label: 'Até 20.000' },
  { value: 'ate_50000', label: 'Até 50.000' },
  { value: 'ate_70000', label: 'Até 70.000' },
  { value: 'maior_70000', label: 'Maior que 70.000' },
  { value: 'maior_70000_consumo', label: 'Maior que 70.000 com Nota Fiscal de Consumo' }
];

export const modalidadeOptions = [
  { value: 'on-premise', label: 'On-premisse (Instalação local)' },
  { value: 'saas', label: 'SaaS (Software as a Service)' }
];

export const prazoContratacaoOptions = [
  { value: 12, label: '12 meses' },
  { value: 24, label: '24 meses' },
  { value: 36, label: '36 meses' },
  { value: 48, label: '48 meses' },
  { value: 60, label: '60 meses' }
];

// ===== CAMPOS COMPARTILHADOS ENTRE FORMULÁRIOS =====

// Campos do Step 1 (Identificação) - Comuns aos dois produtos
export const commonStep1Fields = {
  crm: {
    label: 'CRM',
    placeholder: 'Digite o CRM',
    required: true,
    type: 'text' as const
  },
  razaoSocial: {
    label: 'Razão Social',
    placeholder: 'Digite a razão social da empresa',
    required: true,
    type: 'text' as const
  },
  cnpj: {
    label: 'CNPJ',
    placeholder: '00.000.000/0000-00',
    required: true,
    type: 'text' as const,
    mask: true
  },
  municipio: {
    label: 'Município',
    placeholder: 'Selecione o município',
    required: true,
    type: 'select' as const,
    dependsOn: 'uf'
  },
  uf: {
    label: 'UF',
    placeholder: 'Selecione o estado',
    required: true,
    type: 'select' as const,
    options: estadosBrasil
  },
  responsavel: {
    label: 'Responsável',
    placeholder: 'Nome do responsável',
    required: true,
    type: 'text' as const
  },
  email: {
    label: 'E-mail Corporativo',
    placeholder: 'Insira um endereço de email',
    required: true,
    type: 'email' as const
  }
};

// Campos do Step 2 - Comuns aos dois produtos
export const commonStep2Fields = {
  segmento: {
    label: 'Segmento da Empresa',
    placeholder: 'Selecione o segmento',
    required: true,
    type: 'select' as const,
    options: segmentosEmpresa
  },
  quantidadeEmpresas: {
    label: 'Quantidade de Empresas',
    placeholder: '1',
    required: true,
    type: 'number' as const,
    min: 1,
    max: 999
  },
  quantidadeUfs: {
    label: 'Quantidade de UFs',
    placeholder: '1',
    required: true,
    type: 'number' as const,
    min: 1,
    max: 27
  },
  volumetriaNotas: {
    label: 'Volumetria de Notas (mensal)',
    placeholder: 'Selecione a volumetria',
    required: true,
    type: 'select' as const,
    options: volumetriaOptions
  },
  modalidade: {
    label: 'Modalidade',
    placeholder: 'Selecione a modalidade',
    required: true,
    type: 'select' as const,
    options: modalidadeOptions
  },
  prazoContratacao: {
    label: 'Prazo de Contratação',
    placeholder: 'Selecione o prazo',
    required: true,
    type: 'select' as const,
    options: prazoContratacaoOptions
  }
};

// ===== CAMPOS ESPECÍFICOS DO COMPLY FISCAL =====

export const segmentosFiscal = [
  { value: 'industria', label: 'Indústria, Varejo ou Outros' },
  { value: 'utilities', label: 'Utilities (Serviços Públicos - Energia, Água, Gás, Saneamento)' },
  { value: 'servico', label: 'Serviço' }
];

export const escopoFiscalOptions = [
  { value: 'apuracao_icms', label: 'Apuração de ICMS' },
  { value: 'apuracao_ipi', label: 'Apuração de IPI' },
  { value: 'apuracao_pis_cofins', label: 'Apuração de PIS/COFINS' },
  { value: 'sped_fiscal', label: 'SPED Fiscal (EFD)' },
  { value: 'sped_contribuicoes', label: 'SPED Contribuições (EFD Contribuições)' },
  { value: 'reinf', label: 'e-Reinf (Retenções)' },
  { value: 'dctf', label: 'DCTF (Declaração de Débitos e Créditos Tributários)' },
  { value: 'gias', label: 'GIAs Estaduais' },
  { value: 'substituicao_tributaria', label: 'Substituição Tributária' },
  { value: 'diferencial_aliquota', label: 'Diferencial de Alíquota' }
];

export const volumetriaFiscalOptions = [
  { value: 'ate_5000', label: 'Até 5.000 documentos/mês' },
  { value: 'ate_15000', label: 'Até 15.000 documentos/mês' },
  { value: 'ate_30000', label: 'Até 30.000 documentos/mês' },
  { value: 'ate_50000', label: 'Até 50.000 documentos/mês' },
  { value: 'maior_50000', label: 'Maior que 50.000 documentos/mês' }
];

// Campos específicos do Comply Fiscal
export const fiscalStep2Fields = {
  segmento: {
    ...commonStep2Fields.segmento,
    options: segmentosFiscal
  },
  escopo: {
    label: 'Escopo do Comply Fiscal',
    placeholder: 'Selecione os módulos necessários',
    required: true,
    type: 'checkbox' as const,
    options: escopoFiscalOptions
  },
  volumetriaNotas: {
    ...commonStep2Fields.volumetriaNotas,
    label: 'Volumetria de Documentos Fiscais (mensal)',
    options: volumetriaFiscalOptions
  }
};

// ===== UTILITÁRIOS PARA VALIDAÇÃO =====

export const getFieldConfig = (fieldName: string, product: 'edocs' | 'fiscal' = 'edocs') => {
  // Campos do Step 1 são sempre comuns
  if (fieldName in commonStep1Fields) {
    return commonStep1Fields[fieldName as keyof typeof commonStep1Fields];
  }
  
  // Campos do Step 2 podem ser específicos
  if (product === 'fiscal' && fieldName in fiscalStep2Fields) {
    return fiscalStep2Fields[fieldName as keyof typeof fiscalStep2Fields];
  }
  
  if (fieldName in commonStep2Fields) {
    return commonStep2Fields[fieldName as keyof typeof commonStep2Fields];
  }
  
  return null;
};

export const validateField = (fieldName: string, value: any, product: 'edocs' | 'fiscal' = 'edocs'): string | null => {
  const config = getFieldConfig(fieldName, product);
  
  if (!config) return null;
  
  if (config.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${config.label} é obrigatório`;
  }
  
  if (config.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'E-mail inválido';
    }
  }
  
  if (config.type === 'number') {
    const num = Number(value);
    if (config.min && num < config.min) {
      return `${config.label} deve ser no mínimo ${config.min}`;
    }
    if (config.max && num > config.max) {
      return `${config.label} deve ser no máximo ${config.max}`;
    }
  }
  
  return null;
};
