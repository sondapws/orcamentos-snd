import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { useConfigPrefeituras } from '@/hooks/useConfigPrefeituras';

interface ConfigPrefeiiturasProps {
  regraId?: string;
}

const ConfigPrefeituras = ({ regraId }: ConfigPrefeiiturasProps) => {
  const { configs, loading, criarConfig, atualizarConfig, excluirConfig } = useConfigPrefeituras(regraId);
  const [novaConfig, setNovaConfig] = useState({
    quantidade_municipios: '',
    calibracao: '',
    sob_consulta: false
  });

  const handleAdicionarConfig = async () => {
    if (!regraId || !novaConfig.quantidade_municipios) return;

    try {
      await criarConfig({
        regra_id: regraId,
        quantidade_municipios: parseInt(novaConfig.quantidade_municipios),
        calibracao: novaConfig.calibracao ? parseFloat(novaConfig.calibracao) : undefined,
        sob_consulta: novaConfig.sob_consulta
      });

      setNovaConfig({
        quantidade_municipios: '',
        calibracao: '',
        sob_consulta: false
      });
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
    }
  };

  const handleAtualizarConfig = async (id: string, campo: string, valor: any) => {
    await atualizarConfig(id, { [campo]: valor });
  };

  if (!regraId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Selecione uma regra para configurar as prefeituras</p>
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
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Prefeituras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para nova configuração */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">Adicionar Nova Configuração</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Quantidade de Municípios</Label>
              <Input
                type="number"
                value={novaConfig.quantidade_municipios}
                onChange={(e) => setNovaConfig(prev => ({ ...prev, quantidade_municipios: e.target.value }))}
                placeholder="Ex: 100"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Calibração (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={novaConfig.calibracao}
                onChange={(e) => setNovaConfig(prev => ({ ...prev, calibracao: e.target.value }))}
                placeholder="Ex: 15.50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Sob Consulta</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  checked={novaConfig.sob_consulta}
                  onCheckedChange={(checked) => setNovaConfig(prev => ({ ...prev, sob_consulta: checked === true }))}
                />
                <span className="text-sm">Marcar como sob consulta</span>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAdicionarConfig}
                disabled={!novaConfig.quantidade_municipios}
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
                <TableHead>Quantidade de Municípios</TableHead>
                <TableHead>Calibração (%)</TableHead>
                <TableHead>Sob Consulta</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Nenhuma configuração cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Input
                        type="number"
                        value={config.quantidade_municipios}
                        onChange={(e) => handleAtualizarConfig(config.id!, 'quantidade_municipios', parseInt(e.target.value))}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      {config.sob_consulta ? (
                        <span className="text-blue-600 font-medium">Sob Consulta</span>
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          value={config.calibracao || ''}
                          onChange={(e) => handleAtualizarConfig(config.id!, 'calibracao', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={config.sob_consulta}
                        onCheckedChange={(checked) => handleAtualizarConfig(config.id!, 'sob_consulta', checked === true)}
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
      </CardContent>
    </Card>
  );
};

export default ConfigPrefeituras;