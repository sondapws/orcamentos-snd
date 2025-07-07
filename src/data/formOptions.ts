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

export const municipiosPorEstado: Record<string, string[]> = {
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasiléia', 'Plácido de Castro', 'Xapuri', 'Senador Guiomard', 'Acrelândia'],
  'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares', 'São Miguel dos Campos', 'Santana do Ipanema', 'Delmiro Gouveia', 'Coruripe'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande', 'Pedra Branca do Amapari', 'Vitória do Jari', 'Tartarugalzinho', 'Amapá'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Tabatinga', 'Maués', 'São Gabriel da Cachoeira', 'Humaitá'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas'],
  'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá'],
  'DF': ['Brasília'],
  'ES': ['Vila Velha', 'Serra', 'Cariacica', 'Vitória', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'],
  'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Barra do Garças', 'Primavera do Leste'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina', 'Sidrolândia', 'Maracaju', 'São Gabriel do Oeste'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
  'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança'],
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Mamanguape'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Bandeira Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'Altos', 'Oeiras', 'Pedro II'],
  'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'São João de Meriti', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'Santa Cruz'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste', 'Buritis'],
  'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí', 'Bonfim', 'Cantá', 'Normandia', 'São João da Baliza', 'São Luiz'],
  'SC': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça'],
  'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José dos Campos'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Simão Dias', 'Propriá', 'Canindé de São Francisco'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Guaraí', 'Tocantinópolis', 'Miracema do Tocantins', 'Dianópolis']
};

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
