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
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasiléia', 'Plácido de Castro', 'Xapuri', 'Senador Guiomard', 'Acrelândia', 'Epitaciolândia', 'Mâncio Lima', 'Bujari', 'Capixaba', 'Jordão', 'Manoel Urbano', 'Marechal Thaumaturgo', 'Porto Walter', 'Rodrigues Alves', 'Santa Rosa do Purus', 'Assis Brasil', 'Porto Acre'],
  'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares', 'São Miguel dos Campos', 'Santana do Ipanema', 'Delmiro Gouveia', 'Coruripe', 'Campo Alegre', 'Maribondo', 'Girau do Ponciano', 'Viçosa', 'São Sebastião', 'Pilar', 'Murici', 'Messias', 'Matriz de Camaragibe', 'Limoeiro de Anadia'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande', 'Pedra Branca do Amapari', 'Vitória do Jari', 'Tartarugalzinho', 'Amapá', 'Calçoene', 'Cutias', 'Ferreira Gomes', 'Itaubal', 'Pracuúba', 'Serra do Navio'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Tabatinga', 'Maués', 'São Gabriel da Cachoeira', 'Humaitá', 'Lábrea', 'Eirunepé', 'Benjamin Constant', 'Manicoré', 'Carauari', 'Barcelos', 'São Paulo de Olivença', 'Tonantins', 'Fonte Boa', 'Jutaí', 'Presidente Figueiredo', 'Iranduba', 'Rio Preto da Eva', 'Novo Airão', 'Silves', 'Urucará'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Alagoinhas', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso', 'Eunápolis', 'Santo Antônio de Jesus', 'Valença', 'Candeias', 'Guanambi', 'Jacobina', 'Serrinha', 'Senhor do Bonfim', 'Dias d\'Ávila', 'Luís Eduardo Magalhães', 'Itapetinga'],
  'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá', 'Pacatuba', 'Aquiraz', 'Quixeramobim', 'Canindé', 'Russas', 'Crateús', 'Tianguá', 'Aracati', 'Cascavel', 'Pacajus', 'Icó', 'Horizonte', 'Camocim', 'Morada Nova', 'Acopiara'],
  'DF': ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina', 'São Sebastião', 'Recanto das Emas', 'Santa Maria', 'Gama', 'Sobradinho', 'Paranoá', 'Núcleo Bandeirante', 'Riacho Fundo', 'Guará', 'Candangolândia', 'Águas Claras', 'Riacho Fundo II', 'Varjão', 'Park Way', 'SCIA', 'Sobradinho II', 'Jardim Botânico', 'Itapoã', 'SIA', 'Vicente Pires', 'Fercal', 'Sol Nascente/Pôr do Sol'],
  'ES': ['Vila Velha', 'Serra', 'Cariacica', 'Vitória', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz', 'Viana', 'Nova Venécia', 'Barra de São Francisco', 'Santa Teresa', 'São Gabriel da Palha', 'Castelo', 'Marataízes', 'Venda Nova do Imigrante', 'Domingos Martins', 'Itapemirim', 'Alegre', 'Baixo Guandu', 'Conceição da Barra', 'Piúma', 'Fundão'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama', 'Itumbiara', 'Senador Canedo', 'Catalão', 'Jataí', 'Planaltina', 'Caldas Novas', 'Santo Antônio do Descoberto', 'Goianésia', 'Cidade Ocidental', 'Mineiros', 'Cristalina', 'Inhumas', 'Ipatinga', 'Quirinópolis', 'Goiás'],
  'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas', 'Barra do Corda', 'Santa Inês', 'Pinheiro', 'Pedreiras', 'Santa Luzia', 'Chapadinha', 'Presidente Dutra', 'Viana', 'Grajaú', 'Itapecuru Mirim', 'Coelho Neto', 'Tutóia', 'Coroatá', 'São Mateus do Maranhão', 'Raposa'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Barra do Garças', 'Primavera do Leste', 'Alta Floresta', 'Pontes e Lacerda', 'Nova Mutum', 'Colíder', 'Diamantino', 'Juína', 'Mirassol d\'Oeste', 'Água Boa', 'Guarantã do Norte', 'Peixoto de Azevedo', 'Campo Novo do Parecis', 'Poconé', 'Jaciara', 'São José do Rio Claro', 'Brasnorte'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina', 'Sidrolândia', 'Maracaju', 'São Gabriel do Oeste', 'Coxim', 'Aquidauana', 'Paranaíba', 'Cassilândia', 'Amambai', 'Miranda', 'Caarapó', 'Anastácio', 'Bonito', 'Jardim', 'Ivinhema', 'Chapadão do Sul', 'Nova Alvorada do Sul', 'Ribas do Rio Pardo', 'Bataguassu'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Santa Luzia', 'Sete Lagoas', 'Patos de Minas', 'Poços de Caldas', 'Barbacena', 'Pouso Alegre', 'Teófilo Otoni', 'Sabará', 'Vespasiano', 'Divinópolis', 'Ibirité', 'Araguari', 'Passos', 'Conselheiro Lafaiete', 'Varginha'],
  'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança', 'Altamira', 'Tucuruí', 'Benevides', 'Itaituba', 'Barcarena', 'Breves', 'Tailândia', 'Paragominas', 'Redenção', 'Oriximiná', 'Capitão Poço', 'Tomé-Açu', 'Soure', 'Monte Alegre', 'Marapanim'],
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Mamanguape', 'Sapé', 'Pombal', 'Esperança', 'São Bento', 'Monteiro', 'Areia', 'Picuí', 'Itabaiana', 'Conde', 'Mari', 'Princesa Isabel', 'Solânea', 'Queimadas', 'Rio Tinto', 'Alagoa Grande'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Araucária', 'Toledo', 'Apucarana', 'Pinhais', 'Campo Largo', 'Arapongas', 'Almirante Tamandaré', 'Umuarama', 'Paranavaí', 'Sarandi', 'Fazenda Rio Grande', 'Cambé', 'Piraquara', 'Francisco Beltrão', 'Cianorte'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão', 'São Lourenço da Mata', 'Abreu e Lima', 'Igarassu', 'Goiana', 'Belo Jardim', 'Arcoverde', 'Ouricuri', 'Ipojuca', 'Serra Talhada', 'Gravatá', 'Carpina', 'Salgueiro', 'São Bento do Una', 'Bezerros', 'Escada'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'Altos', 'Oeiras', 'Pedro II', 'União', 'Valença do Piauí', 'José de Freitas', 'Esperantina', 'São Raimundo Nonato', 'Piracuruca', 'Amarante', 'Luzilândia', 'Bom Jesus', 'Corrente', 'Simplício Mendes', 'Cocal', 'Fronteiras', 'Regeneração', 'São João do Piauí'],
  'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'São João de Meriti', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda', 'Magé', 'Macaé', 'Itaboraí', 'Cabo Frio', 'Nova Friburgo', 'Barra Mansa', 'Angra dos Reis', 'Mesquita', 'Teresópolis', 'Nilópolis', 'Queimados', 'Maricá', 'Resende', 'Araruama', 'Tanguá'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'Santa Cruz', 'Nova Cruz', 'João Câmara', 'Canguaretama', 'São José de Mipibu', 'Açu', 'Apodi', 'Pau dos Ferros', 'São Paulo do Potengi', 'Extremoz', 'Touros', 'Areia Branca', 'Baraúna', 'Pedro Velho', 'São Miguel', 'Nísia Floresta'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Santa Cruz do Sul', 'Cachoeirinha', 'Bagé', 'Bento Gonçalves', 'Erechim', 'Guaíba', 'Cachoeira do Sul', 'Santana do Livramento', 'Ijuí', 'Sapiranga', 'Santo Ângelo'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste', 'Buritis', 'Costa Marques', 'Colorado do Oeste', 'Cerejeiras', 'Machadinho d\'Oeste', 'Presidente Médici', 'Espigão d\'Oeste', 'Nova Brasilândia d\'Oeste', 'Alta Floresta d\'Oeste', 'Chupinguaia', 'Pimenta Bueno', 'São Miguel do Guaporé', 'Nova Mamoré', 'Theobroma', 'Corumbiara', 'Candeias do Jamari'],
  'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí', 'Bonfim', 'Cantá', 'Normandia', 'São João da Baliza', 'São Luiz', 'Caroebe', 'Iracema', 'Amajari', 'Pacaraima', 'Uiramutã'],
  'SC': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça', 'Balneário Camboriú', 'Brusque', 'Tubarão', 'São Bento do Sul', 'Caçador', 'Camboriú', 'Navegantes', 'Concórdia', 'Rio do Sul', 'Araranguá', 'Gaspar', 'Biguaçu', 'Indaial', 'Itapema', 'Mafra'],
  'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José dos Campos', 'Mogi das Cruzes', 'Diadema', 'Jundiaí', 'Carapicuíba', 'Piracicaba', 'Bauru', 'São Vicente', 'Itaquaquecetuba', 'Franca', 'Guarujá', 'Taubaté', 'Praia Grande', 'Limeira', 'Suzano', 'Taboão da Serra'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Simão Dias', 'Propriá', 'Canindé de São Francisco', 'Barra dos Coqueiros', 'Nossa Senhora das Dores', 'Ribeirópolis', 'Aquidabã', 'Neópolis', 'Carmópolis', 'Porto da Folha', 'Poço Redondo', 'Nossa Senhora da Glória', 'Laranjeiras', 'Capela', 'Umbaúba', 'Indiaroba', 'Japaratuba', 'Campo do Brito'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Guaraí', 'Tocantinópolis', 'Miracema do Tocantins', 'Dianópolis', 'Araguatins', 'Formoso do Araguaia', 'Taguatinga', 'Pedro Afonso', 'Arraias', 'Augustinópolis', 'Xambioá', 'Natividade', 'Alvorada', 'Filadélfia', 'Axixá do Tocantins', 'Babaçulândia', 'Ananás', 'Campos Lindos', 'Peixe']
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
