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
