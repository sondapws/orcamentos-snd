import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useConfigSaas } from '@/hooks/useConfigSaas';

interface ConfigSaasProps {
  regraId?: string;
}

const ConfigSaas = ({ regraId }: ConfigSaasProps) => {
  const { configs, loading, atualizarConfig } = useConfigSaas(regraId);

  const [tempValues, setTempValues] = useState<Record<string, number>>({});

  const handleInputChange = (id: string, campo: string, valor: number) => {
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

  const getInputValue = (id: string, campo: string, defaultValue: number) => {
    const key = `${id}-${campo}`;
    return tempValues[key] !== undefined ? tempValues[key] : defaultValue;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatVolumetria = (min: number, max?: number) => {
    if (!max) {
      return `+ ${min.toLocaleString('pt-BR')} notas`;
    }
    return `${min.toLocaleString('pt-BR')} - ${max.toLocaleString('pt-BR')} notas`;
  };

  if (!regraId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Selecione uma regra para configurar o SaaS</p>
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
        <CardTitle>Configuração SaaS - Custos de Contratação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Configuração dos custos de contratação SaaS baseados na volumetria do cliente.
          </p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Nome do Plano</TableHead>
                  <TableHead>Volumetria</TableHead>
                  <TableHead>Hosting (R$)</TableHead>
                  <TableHead>DevOps (R$)</TableHead>
                  <TableHead>Setup (R$)</TableHead>
                  <TableHead>Total (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => {
                  const total = config.hosting + config.devops + config.setup;
                  return (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {config.plano}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {config.nome_plano}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatVolumetria(config.volumetria_min, config.volumetria_max)}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={getInputValue(config.id!, 'hosting', config.hosting)}
                          onChange={(e) => handleInputChange(config.id!, 'hosting', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleInputBlur(config.id!, 'hosting')}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={getInputValue(config.id!, 'devops', config.devops)}
                          onChange={(e) => handleInputChange(config.id!, 'devops', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleInputBlur(config.id!, 'devops')}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={getInputValue(config.id!, 'setup', config.setup)}
                          onChange={(e) => handleInputChange(config.id!, 'setup', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleInputBlur(config.id!, 'setup')}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Informações dos Planos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>PP (Standard 7):</strong> Até 7.000 notas
              </div>
              <div>
                <strong>P (Standard 20):</strong> Até 20.000 notas
              </div>
              <div>
                <strong>M (Standard 50):</strong> Até 50.000 notas
              </div>
              <div>
                <strong>MDB (Standard 70):</strong> Até 70.000 notas
              </div>
              <div>
                <strong>G (Plus 70):</strong> Mais de 70.000 notas
              </div>
              <div>
                <strong>GG (Plus 70 Consumo):</strong> Mais de 70.000 notas com consumo
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigSaas;