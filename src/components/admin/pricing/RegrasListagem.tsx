import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRegrasPrecificacao } from '@/hooks/useRegrasPrecificacao';
import { Trash2, Edit, Plus } from 'lucide-react';

interface RegrasListagemProps {
  onNovaRegra: () => void;
  onEditarRegra: (regraId: string) => void;
}

const RegrasListagem = ({ onNovaRegra, onEditarRegra }: RegrasListagemProps) => {
  const { regras, loading, excluirRegra } = useRegrasPrecificacao();

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
                    <TableCell>{formatPercent(regra.margem_venda)}</TableCell>
                    <TableCell>{formatCurrency(regra.receita_mensal)}</TableCell>
                    <TableCell>{formatCurrency(regra.custo_mensal)}</TableCell>
                    <TableCell>{regra.qtd_clientes}</TableCell>
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