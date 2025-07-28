
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DadoProdutoAno, useDadosProdutoAno } from '@/hooks/useDadosProdutoAno';
import { useAplicativos } from '@/hooks/useAplicativos';

interface DadosProdutoTableProps {
  aplicativoId?: string;
}

const DadosProdutoTable: React.FC<DadosProdutoTableProps> = ({ aplicativoId }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DadoProdutoAno>>({});
  const [showNewForm, setShowNewForm] = useState(false);

  const { dados, loading, updateDado, deleteDado } = useDadosProdutoAno(aplicativoId);
  const { aplicativos } = useAplicativos();
  const { toast } = useToast();

  const getAplicativoNome = (id: string) => {
    return aplicativos.find(app => app.id === id)?.nome || 'Desconhecido';
  };

  const handleEdit = (dado: DadoProdutoAno) => {
    setEditingId(dado.id);
    setEditData({
      calibracao_lu: dado.calibracao_lu,
      lu_meses: dado.lu_meses,
      lu_ma_minima: dado.lu_ma_minima,
      margem_venda: dado.margem_venda,
    });
  };

  const handleSave = async (id: string) => {
    const { error } = await updateDado(id, editData);
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso",
      });
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir estes dados?')) {
      const { error } = await deleteDado(id);
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir dados",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Dados excluídos com sucesso",
        });
      }
    }
  };

  const formatCurrency = (value: number | undefined) => {
    return value ? new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value) : 'R$ 0,00';
  };

  const formatPercent = (value: number | undefined) => {
    return value ? `${value.toFixed(2)}%` : '0.00%';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dados Principais de Produtos por Ano</CardTitle>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novos Dados
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aplicativo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead className="bg-yellow-100">Calibração LU</TableHead>
                  <TableHead className="bg-yellow-100">LU Meses</TableHead>
                  <TableHead className="bg-yellow-100">LU MA Mínima</TableHead>
                  <TableHead className="bg-yellow-100">Margem Venda %</TableHead>
                  <TableHead className="bg-gray-100">Custo %</TableHead>
                  <TableHead className="bg-gray-100">Receita Mensal</TableHead>
                  <TableHead className="bg-gray-100">Custo Mensal</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((dado) => (
                  <TableRow key={dado.id}>
                    <TableCell>{getAplicativoNome(dado.aplicativo_id)}</TableCell>
                    <TableCell>{dado.ano}</TableCell>
                    
                    {/* Campos editáveis (amarelos) */}
                    <TableCell className="bg-yellow-50">
                      {editingId === dado.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.calibracao_lu || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            calibracao_lu: parseFloat(e.target.value)
                          })}
                          className="w-20"
                        />
                      ) : (
                        dado.calibracao_lu.toFixed(2)
                      )}
                    </TableCell>
                    
                    <TableCell className="bg-yellow-50">
                      {editingId === dado.id ? (
                        <Input
                          type="number"
                          value={editData.lu_meses || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            lu_meses: parseInt(e.target.value)
                          })}
                          className="w-20"
                        />
                      ) : (
                        dado.lu_meses
                      )}
                    </TableCell>
                    
                    <TableCell className="bg-yellow-50">
                      {editingId === dado.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.lu_ma_minima || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            lu_ma_minima: parseFloat(e.target.value)
                          })}
                          className="w-20"
                        />
                      ) : (
                        dado.lu_ma_minima.toFixed(2)
                      )}
                    </TableCell>
                    
                    <TableCell className="bg-yellow-50">
                      {editingId === dado.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.margem_venda || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            margem_venda: parseFloat(e.target.value)
                          })}
                          className="w-20"
                        />
                      ) : (
                        formatPercent(dado.margem_venda)
                      )}
                    </TableCell>
                    
                    {/* Campos somente leitura (cinza) */}
                    <TableCell className="bg-gray-100">
                      {formatPercent(dado.custo_percent)}
                    </TableCell>
                    <TableCell className="bg-gray-100">
                      {formatCurrency(dado.receita_mensal)}
                    </TableCell>
                    <TableCell className="bg-gray-100">
                      {formatCurrency(dado.custo_mensal)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingId === dado.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(dado.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(dado)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(dado.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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

export default DadosProdutoTable;
