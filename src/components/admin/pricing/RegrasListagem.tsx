import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRegrasPrecificacao } from '@/hooks/useRegrasPrecificacao';
import { Trash2, Edit, Plus } from 'lucide-react';

interface RegrasListagemProps {
  onNovaRegra: () => void;
  onEditarRegra: (regraId: string) => void;
}

const RegrasListagem = ({ onNovaRegra, onEditarRegra }: RegrasListagemProps) => {
  const { regras, loading, excluirRegra, atualizarRegra } = useRegrasPrecificacao();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta regra?')) {
      await excluirRegra(id);
    }
  };

  const handleStartEdit = (regraId: string, campo: string, valor: any) => {
    const key = `${regraId}-${campo}`;
    setEditingCell(key);
    setTempValues(prev => ({ ...prev, [key]: valor }));
  };

  const handleInputChange = (regraId: string, campo: string, valor: any) => {
    const key = `${regraId}-${campo}`;
    setTempValues(prev => ({ ...prev, [key]: valor }));
  };

  const handleSaveEdit = async (regraId: string, campo: string) => {
    const key = `${regraId}-${campo}`;
    const valor = tempValues[key];
    
    if (valor !== undefined) {
      await atualizarRegra(regraId, { [campo]: valor });
    }
    
    setEditingCell(null);
    setTempValues(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setTempValues({});
  };

  const renderEditableCell = (regra: any, campo: string, valor: any, tipo: 'currency' | 'percent' | 'number' = 'number') => {
    const key = `${regra.id}-${campo}`;
    const isEditing = editingCell === key;
    
    if (isEditing) {
      const inputValue = tempValues[key] !== undefined ? tempValues[key] : valor;
      return (
        <Input
          type="number"
          step={tipo === 'currency' ? "0.01" : tipo === 'percent' ? "0.01" : "1"}
          value={inputValue}
          onChange={(e) => handleInputChange(regra.id, campo, parseFloat(e.target.value) || 0)}
          onBlur={() => handleSaveEdit(regra.id, campo)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit(regra.id, campo);
            if (e.key === 'Escape') handleCancelEdit();
          }}
          className="w-full"
          autoFocus
        />
      );
    }

    let displayValue = valor;
    if (tipo === 'currency') displayValue = formatCurrency(valor);
    if (tipo === 'percent') displayValue = formatPercent(valor);

    return (
      <div 
        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
        onClick={() => handleStartEdit(regra.id, campo, valor)}
        title="Clique para editar"
      >
        {displayValue}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-gray-500">Carregando regras...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Regras de Precificação</CardTitle>
        <Button onClick={onNovaRegra} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Regra
        </Button>
      </CardHeader>
      <CardContent>
        {regras.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhuma regra de precificação cadastrada</p>
            <Button onClick={onNovaRegra}>
              Criar primeira regra
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Margem Venda</TableHead>
                  <TableHead>Receita Mensal</TableHead>
                  <TableHead>Custo Mensal</TableHead>
                  <TableHead>Qtd Clientes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regras.map((regra: any) => (
                  <TableRow key={regra.id}>
                    <TableCell className="font-medium">{regra.ano}</TableCell>
                    <TableCell>{regra.aplicativos?.nome || 'N/A'}</TableCell>
                    <TableCell>{renderEditableCell(regra, 'margem_venda', regra.margem_venda, 'percent')}</TableCell>
                    <TableCell>{renderEditableCell(regra, 'receita_mensal', regra.receita_mensal, 'currency')}</TableCell>
                    <TableCell>{renderEditableCell(regra, 'custo_mensal', regra.custo_mensal, 'currency')}</TableCell>
                    <TableCell>{renderEditableCell(regra, 'qtd_clientes', regra.qtd_clientes, 'number')}</TableCell>
                    <TableCell>
                      <Badge variant={regra.ano >= new Date().getFullYear() ? "default" : "secondary"}>
                        {regra.ano >= new Date().getFullYear() ? "Ativa" : "Histórica"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditarRegra(regra.id)}
                          title="Configurações avançadas"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExcluir(regra.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegrasListagem;