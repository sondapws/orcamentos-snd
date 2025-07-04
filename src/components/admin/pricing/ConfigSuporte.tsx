import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useConfigSuporte } from '@/hooks/useConfigSuporte';

interface ConfigSuporteProps {
  regraId?: string;
}

const ConfigSuporte = ({ regraId }: ConfigSuporteProps) => {
  const { configs, loading, criarConfig, atualizarConfig, excluirConfig } = useConfigSuporte(regraId);
  const [novaConfig, setNovaConfig] = useState({
    ano: new Date().getFullYear().toString(),
    tipo_suporte: '',
    quantidade_horas: '',
    preco_unitario: ''
  });

  const handleAdicionarConfig = async () => {
    if (!regraId || !novaConfig.tipo_suporte || !novaConfig.quantidade_horas || !novaConfig.preco_unitario) return;

    try {
      await criarConfig({
        regra_id: regraId,
        ano: parseInt(novaConfig.ano),
        tipo_suporte: novaConfig.tipo_suporte,
        quantidade_horas: parseFloat(novaConfig.quantidade_horas),
        preco_unitario: parseFloat(novaConfig.preco_unitario)
      });

      setNovaConfig({
        ano: new Date().getFullYear().toString(),
        tipo_suporte: '',
        quantidade_horas: '',
        preco_unitario: ''
      });
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
    }
  };

  const [tempValues, setTempValues] = useState<Record<string, any>>({});

  const handleInputChange = (id: string, campo: string, valor: any) => {
    setTempValues(prev => ({
      ...prev,
      [`${id}-${campo}`]: valor
    }));
  };

  const handleInputBlur = async (id: string, campo: string) => {
    const key = `${id}-${campo}`;
    if (tempValues[key] !== undefined) {
      await atualizarConfig(id, { [campo]: tempValues[key] });
      setTempValues(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getInputValue = (id: string, campo: string, defaultValue: any) => {
    const key = `${id}-${campo}`;
    return tempValues[key] !== undefined ? tempValues[key] : defaultValue;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!regraId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Selecione uma regra para configurar o suporte</p>
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
        <CardTitle>Configuração de Suporte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para nova configuração */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">Adicionar Nova Configuração de Suporte</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                type="number"
                value={novaConfig.ano}
                onChange={(e) => setNovaConfig(prev => ({ ...prev, ano: e.target.value }))}
                min={new Date().getFullYear()}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo do Suporte</Label>
              <Input
                value={novaConfig.tipo_suporte}
                onChange={(e) => setNovaConfig(prev => ({ ...prev, tipo_suporte: e.target.value }))}
                placeholder="Ex: Suporte Técnico"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Quantidade de Horas</Label>
              <Input
                type="number"
                step="0.5"
                value={novaConfig.quantidade_horas}
                onChange={(e) => setNovaConfig(prev => ({ ...prev, quantidade_horas: e.target.value }))}
                placeholder="Ex: 40"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preço Unitário (R$/hora)</Label>
              <Input
                type="number"
                step="0.01"
                value={novaConfig.preco_unitario}
                onChange={(e) => setNovaConfig(prev => ({ ...prev, preco_unitario: e.target.value }))}
                placeholder="Ex: 150.00"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAdicionarConfig}
                disabled={!novaConfig.tipo_suporte || !novaConfig.quantidade_horas || !novaConfig.preco_unitario}
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
                <TableHead>Ano</TableHead>
                <TableHead>Tipo do Suporte</TableHead>
                <TableHead>Quantidade de Horas</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma configuração de suporte cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Input
                        type="number"
                        value={getInputValue(config.id!, 'ano', config.ano)}
                        onChange={(e) => handleInputChange(config.id!, 'ano', parseInt(e.target.value))}
                        onBlur={() => handleInputBlur(config.id!, 'ano')}
                        className="w-20"
                        min={new Date().getFullYear()}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={getInputValue(config.id!, 'tipo_suporte', config.tipo_suporte)}
                        onChange={(e) => handleInputChange(config.id!, 'tipo_suporte', e.target.value)}
                        onBlur={() => handleInputBlur(config.id!, 'tipo_suporte')}
                        className="min-w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.5"
                        value={getInputValue(config.id!, 'quantidade_horas', config.quantidade_horas)}
                        onChange={(e) => handleInputChange(config.id!, 'quantidade_horas', parseFloat(e.target.value))}
                        onBlur={() => handleInputBlur(config.id!, 'quantidade_horas')}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={getInputValue(config.id!, 'preco_unitario', config.preco_unitario)}
                        onChange={(e) => handleInputChange(config.id!, 'preco_unitario', parseFloat(e.target.value))}
                        onBlur={() => handleInputBlur(config.id!, 'preco_unitario')}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(config.total)}
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
            <h4 className="font-medium text-blue-900 mb-2">Resumo Financeiro</h4>
            <div className="text-sm text-blue-800">
              <div>
                <strong>Total de Configurações:</strong> {configs.length}
              </div>
              <div>
                <strong>Valor Total:</strong> {formatCurrency(
                  configs.reduce((total, config) => total + config.total, 0)
                )}
              </div>
              <div>
                <strong>Total de Horas:</strong> {configs.reduce((total, config) => total + config.quantidade_horas, 0)}h
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigSuporte;