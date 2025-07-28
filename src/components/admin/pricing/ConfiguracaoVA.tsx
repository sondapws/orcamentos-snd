import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useConfigVA } from '@/hooks/useConfigVA';

interface ConfigVAProps {
  regraId?: string;
  dadosQuestionario?: {
    quantidadeEmpresas: number;
    quantidadeUFs: number;
  };
}

const ConfigVA = ({ regraId, dadosQuestionario }: ConfigVAProps) => {
  const { configs, loading, criarConfig, atualizarConfig, excluirConfig, calcularVA } = useConfigVA(regraId);
  const [novaConfig, setNovaConfig] = useState({
    fator: '',
    va: '',
    agregado: '',
    calibracao: ''
  });
  
  const [dadosCalculados, setDadosCalculados] = useState({
    matrizes: dadosQuestionario?.quantidadeEmpresas || 0,
    ufs: dadosQuestionario?.quantidadeUFs || 0,
    fator: 0,
    va: 0,
    agregado: 0,
    calibracao: 0
  });

  useEffect(() => {
    if (configs.length > 0 && dadosCalculados.matrizes > 0 && dadosCalculados.ufs > 0) {
      const resultado = calcularVA(dadosCalculados.matrizes, dadosCalculados.ufs);
      setDadosCalculados(prev => ({ ...prev, ...resultado }));
    }
  }, [configs, dadosCalculados.matrizes, dadosCalculados.ufs, calcularVA]);

  const handleAdicionarConfig = async () => {
    if (!regraId || !novaConfig.fator || !novaConfig.va || !novaConfig.agregado || !novaConfig.calibracao) return;

    try {
      await criarConfig({
        regra_id: regraId,
        fator: parseFloat(novaConfig.fator),
        va: parseInt(novaConfig.va),
        agregado: parseFloat(novaConfig.agregado),
        calibracao: parseFloat(novaConfig.calibracao)
      });

      setNovaConfig({
        fator: '',
        va: '',
        agregado: '',
        calibracao: ''
      });
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
    }
  };

  const handleAtualizarConfig = async (id: string, campo: string, valor: any) => {
    await atualizarConfig(id, { [campo]: valor });
  };

  const handleAtualizarDados = (campo: string, valor: number) => {
    setDadosCalculados(prev => ({ ...prev, [campo]: valor }));
  };

  if (!regraId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Selecione uma regra para configurar o VA</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Matriz</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={dadosCalculados.matrizes}
              onChange={(e) => handleAtualizarDados('matrizes', parseInt(e.target.value) || 0)}
              className="text-lg font-bold"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">UF</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={dadosCalculados.ufs}
              onChange={(e) => handleAtualizarDados('ufs', parseInt(e.target.value) || 0)}
              className="text-lg font-bold"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {dadosCalculados.fator.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {dadosCalculados.matrizes} × 1,3 + {dadosCalculados.ufs} × 1,7
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">VA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {dadosCalculados.va}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">% Agregado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-600">
              {dadosCalculados.agregado.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Calibração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              {dadosCalculados.calibracao.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações da Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações VA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulário para nova configuração */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-4">Adicionar Nova Configuração</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Fator (decimal)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaConfig.fator}
                  onChange={(e) => setNovaConfig(prev => ({ ...prev, fator: e.target.value }))}
                  placeholder="Ex: 5.40"
                />
              </div>
              
              <div className="space-y-2">
                <Label>VA (inteiro)</Label>
                <Input
                  type="number"
                  value={novaConfig.va}
                  onChange={(e) => setNovaConfig(prev => ({ ...prev, va: e.target.value }))}
                  placeholder="Ex: 120"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Agregado (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaConfig.agregado}
                  onChange={(e) => setNovaConfig(prev => ({ ...prev, agregado: e.target.value }))}
                  placeholder="Ex: 15.50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Calibração (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaConfig.calibracao}
                  onChange={(e) => setNovaConfig(prev => ({ ...prev, calibracao: e.target.value }))}
                  placeholder="Ex: 106.00"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleAdicionarConfig}
                  disabled={!novaConfig.fator || !novaConfig.va || !novaConfig.agregado || !novaConfig.calibracao}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Tabela de configurações */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fator</TableHead>
                  <TableHead>VA</TableHead>
                  <TableHead>Agregado (%)</TableHead>
                  <TableHead>Calibração (%)</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma configuração VA cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.fator}
                          onChange={(e) => handleAtualizarConfig(config.id!, 'fator', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={config.va}
                          onChange={(e) => handleAtualizarConfig(config.id!, 'va', parseInt(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.agregado}
                          onChange={(e) => handleAtualizarConfig(config.id!, 'agregado', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={config.calibracao}
                          onChange={(e) => handleAtualizarConfig(config.id!, 'calibracao', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirConfig(config.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {configs.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Como funciona o cálculo</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>1. O <strong>Fator</strong> é calculado automaticamente: Matriz × 1,3 + UF × 1,7</div>
                <div>2. O sistema encontra o <strong>Fator</strong> mais próximo na tabela</div>
                <div>3. Os valores de <strong>VA</strong>, <strong>% Agregado</strong> e <strong>Calibração</strong> são preenchidos automaticamente</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigVA;