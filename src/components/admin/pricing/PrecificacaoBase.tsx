
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PrecificacaoData {
  ano: number;
  produto: string;
  calibracaoLU: number;
  luMeses: number;
  luMaMinima: number;
  margemVenda: number;
  // Campos calculados
  custoPercent: number;
  receitaMensal: number;
  custoMensal: number;
  receitaCusto: number;
  qtdClientes: number;
  custoMedio: number;
  custoBase: number;
  blocoKLU: number;
  reinfLU: number;
  blocoKMA: number;
  reinfMA: number;
}

interface SegmentoData {
  fiscal20: number;
  contabil30: number;
  fixoBlocoK: number;
  fixoReinf: number;
}

interface LicencaData {
  calibracaoVA: number;
  fiscal70: number;
  contabil30: number;
  fixoBlocoK: number;
  fixoReinf: number;
}

const PrecificacaoBase = () => {
  const [dados, setDados] = useState<PrecificacaoData>({
    ano: 2025,
    produto: 'SISTEMA 1',
    calibracaoLU: 80,
    luMeses: 12,
    luMaMinima: 30,
    margemVenda: 38.65,
    // Valores calculados iniciais
    custoPercent: 0,
    receitaMensal: 0,
    custoMensal: 0,
    receitaCusto: 0,
    qtdClientes: 0,
    custoMedio: 0,
    custoBase: 0,
    blocoKLU: 0,
    reinfLU: 0,
    blocoKMA: 0,
    reinfMA: 0,
  });

  const [segmentos, setSegmentos] = useState({
    industria: { fiscal20: 20, contabil30: 30, fixoBlocoK: 0, fixoReinf: 0 } as SegmentoData,
    utilities: { fiscal20: 24, contabil30: 36, fixoBlocoK: 0, fixoReinf: 0 } as SegmentoData,
    servico: { fiscal20: 12, contabil30: 18, fixoBlocoK: 0, fixoReinf: 0 } as SegmentoData,
  });

  const [licenca, setLicenca] = useState<LicencaData>({
    calibracaoVA: 106,
    fiscal70: 70,
    contabil30: 30,
    fixoBlocoK: 0,
    fixoReinf: 0,
  });

  const [sistema2, setSistema2] = useState({
    prefeituras: 0,
    calibracaoVA: 106,
    mercadorias: { fiscal: 0, contabil: 0, fixoBlocoK: 0, fixoReinf: 0 },
    licencaUso: { fiscal: 0, contabil: 0, fixoBlocoK: 0, fixoReinf: 0 },
  });

  // Função para calcular campos automáticos
  useEffect(() => {
    // Aqui você implementaria os cálculos baseados nas regras de negócio
    const custoPercent = 100 - dados.margemVenda;
    
    setDados(prev => ({
      ...prev,
      custoPercent,
      // Outros cálculos seriam implementados aqui
    }));

    // Calcular campos fixos dos segmentos
    setSegmentos(prev => ({
      industria: {
        ...prev.industria,
        fixoBlocoK: prev.industria.fiscal20 * 1.5,
        fixoReinf: prev.industria.contabil30 * 1.2,
      },
      utilities: {
        ...prev.utilities,
        fixoBlocoK: prev.utilities.fiscal20 * 1.5,
        fixoReinf: prev.utilities.contabil30 * 1.2,
      },
      servico: {
        ...prev.servico,
        fixoBlocoK: prev.servico.fiscal20 * 1.5,
        fixoReinf: prev.servico.contabil30 * 1.2,
      },
    }));
  }, [dados.margemVenda, segmentos.industria.fiscal20, segmentos.industria.contabil30, segmentos.utilities.fiscal20, segmentos.utilities.contabil30, segmentos.servico.fiscal20, segmentos.servico.contabil30]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercent = (num: number) => {
    return `${formatNumber(num)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Seção 1: Dados Principais do Produto */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle>Dados Principais do Produto</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {/* Campos Editáveis */}
            <div className="space-y-2">
              <Label>ANO</Label>
              <Input
                type="number"
                value={dados.ano}
                onChange={(e) => setDados(prev => ({ ...prev, ano: parseInt(e.target.value) || 2025 }))}
                className="bg-yellow-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label>PRODUTO</Label>
              <Select value={dados.produto} onValueChange={(value) => setDados(prev => ({ ...prev, produto: value }))}>
                <SelectTrigger className="bg-yellow-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SISTEMA 1">SISTEMA 1</SelectItem>
                  <SelectItem value="SISTEMA 2">SISTEMA 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>CALIBRAÇÃO LU</Label>
              <Input
                type="number"
                value={dados.calibracaoLU}
                onChange={(e) => setDados(prev => ({ ...prev, calibracaoLU: parseFloat(e.target.value) || 80 }))}
                className="bg-yellow-100"
                placeholder="80%"
              />
            </div>

            <div className="space-y-2">
              <Label>LU (meses)</Label>
              <Input
                type="number"
                value={dados.luMeses}
                onChange={(e) => setDados(prev => ({ ...prev, luMeses: parseInt(e.target.value) || 12 }))}
                className="bg-yellow-100"
              />
            </div>

            <div className="space-y-2">
              <Label>LU x MA (mínima)</Label>
              <Input
                type="number"
                value={dados.luMaMinima}
                onChange={(e) => setDados(prev => ({ ...prev, luMaMinima: parseFloat(e.target.value) || 30 }))}
                className="bg-yellow-100"
                placeholder="30%"
              />
            </div>

            <div className="space-y-2">
              <Label>MARGEM DE VENDA</Label>
              <Input
                type="number"
                step="0.01"
                value={dados.margemVenda}
                onChange={(e) => setDados(prev => ({ ...prev, margemVenda: parseFloat(e.target.value) || 38.65 }))}
                className="bg-yellow-100"
                placeholder="38,65%"
              />
            </div>
          </div>

          {/* Campos Calculados */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>CUSTO %</Label>
              <Input value={formatPercent(dados.custoPercent)} readOnly className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label>RECEITA MENSAL</Label>
              <Input value={formatNumber(dados.receitaMensal)} readOnly className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label>CUSTO MENSAL</Label>
              <Input value={formatNumber(dados.custoMensal)} readOnly className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label>RECEITA X CUSTO</Label>
              <Input value={formatNumber(dados.receitaCusto)} readOnly className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label>QTD CLIENTES</Label>
              <Input value={dados.qtdClientes.toString()} readOnly className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label>CUSTO MÉDIO</Label>
              <Input value={formatNumber(dados.custoMedio)} readOnly className="bg-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Base - Manutenção Sistema 1 */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle>BASE - MANUTENÇÃO SISTEMA 1</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">SEGMENTO</th>
                  <th className="text-left p-2">20% FISCAL</th>
                  <th className="text-left p-2">30% CONTÁBIL</th>
                  <th className="text-left p-2">FIXO BLOCO K</th>
                  <th className="text-left p-2">FIXO REINF</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Indústria - 100%</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={segmentos.industria.fiscal20}
                      onChange={(e) => setSegmentos(prev => ({
                        ...prev,
                        industria: { ...prev.industria, fiscal20: parseFloat(e.target.value) || 20 }
                      }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={segmentos.industria.contabil30}
                      onChange={(e) => setSegmentos(prev => ({
                        ...prev,
                        industria: { ...prev.industria, contabil30: parseFloat(e.target.value) || 30 }
                      }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(segmentos.industria.fixoBlocoK)} readOnly className="bg-white w-24" />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(segmentos.industria.fixoReinf)} readOnly className="bg-white w-24" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Utilities - 120%</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={segmentos.utilities.fiscal20}
                      onChange={(e) => setSegmentos(prev => ({
                        ...prev,
                        utilities: { ...prev.utilities, fiscal20: parseFloat(e.target.value) || 24 }
                      }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={segmentos.utilities.contabil30}
                      onChange={(e) => setSegmentos(prev => ({
                        ...prev,
                        utilities: { ...prev.utilities, contabil30: parseFloat(e.target.value) || 36 }
                      }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(segmentos.utilities.fixoBlocoK)} readOnly className="bg-white w-24" />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(segmentos.utilities.fixoReinf)} readOnly className="bg-white w-24" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Serviço - 60%</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={segmentos.servico.fiscal20}
                      onChange={(e) => setSegmentos(prev => ({
                        ...prev,
                        servico: { ...prev.servico, fiscal20: parseFloat(e.target.value) || 12 }
                      }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={segmentos.servico.contabil30}
                      onChange={(e) => setSegmentos(prev => ({
                        ...prev,
                        servico: { ...prev.servico, contabil30: parseFloat(e.target.value) || 18 }
                      }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(segmentos.servico.fixoBlocoK)} readOnly className="bg-white w-24" />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(segmentos.servico.fixoReinf)} readOnly className="bg-white w-24" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Licença de Uso - Sistema 1 */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle>LICENÇA DE USO - SISTEMA 1</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <Label>Calibração VA</Label>
            <Input
              type="number"
              value={licenca.calibracaoVA}
              onChange={(e) => setLicenca(prev => ({ ...prev, calibracaoVA: parseFloat(e.target.value) || 106 }))}
              className="bg-yellow-100 w-32"
              placeholder="106%"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">SEGMENTO</th>
                  <th className="text-left p-2">70% FISCAL</th>
                  <th className="text-left p-2">30% CONTÁBIL</th>
                  <th className="text-left p-2">FIXO BLOCO K</th>
                  <th className="text-left p-2">FIXO REINF</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-medium">Licença de Uso</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={licenca.fiscal70}
                      onChange={(e) => setLicenca(prev => ({ ...prev, fiscal70: parseFloat(e.target.value) || 70 }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={licenca.contabil30}
                      onChange={(e) => setLicenca(prev => ({ ...prev, contabil30: parseFloat(e.target.value) || 30 }))}
                      className="bg-yellow-100 w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(licenca.fixoBlocoK)} readOnly className="bg-white w-24" />
                  </td>
                  <td className="p-2">
                    <Input value={formatNumber(licenca.fixoReinf)} readOnly className="bg-white w-24" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Seção 4: Base - Manutenção Sistema 2 */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle>BASE - MANUTENÇÃO SISTEMA 2</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label>PREFEITURAS</Label>
              <Input
                type="number"
                value={sistema2.prefeituras}
                onChange={(e) => setSistema2(prev => ({ ...prev, prefeituras: parseInt(e.target.value) || 0 }))}
                className="bg-yellow-100 w-32"
              />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">MERCADORIAS/SERVIÇOS</h4>
              <div className="grid grid-cols-4 gap-4">
                <Input placeholder="FISCAL" className="bg-yellow-100" />
                <Input placeholder="CONTÁBIL" className="bg-yellow-100" />
                <Input placeholder="FIXO BLOCO K" readOnly className="bg-white" />
                <Input placeholder="FIXO REINF" readOnly className="bg-white" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Licença de Uso Sistema 2</h4>
              <div className="mb-2">
                <Label>Calibração VA</Label>
                <Input
                  type="number"
                  value={sistema2.calibracaoVA}
                  onChange={(e) => setSistema2(prev => ({ ...prev, calibracaoVA: parseFloat(e.target.value) || 106 }))}
                  className="bg-yellow-100 w-32"
                  placeholder="106%"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Input placeholder="FISCAL" className="bg-yellow-100" />
                <Input placeholder="CONTÁBIL" className="bg-yellow-100" />
                <Input placeholder="FIXO BLOCO K" readOnly className="bg-white" />
                <Input placeholder="FIXO REINF" readOnly className="bg-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrecificacaoBase;
