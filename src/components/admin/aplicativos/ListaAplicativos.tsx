
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAplicativos } from '@/hooks/useAplicativos';
import AplicativosForm from './FormularioAplicativos';

const AplicativosList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAplicativo, setEditingAplicativo] = useState(null);
  
  const { aplicativos, loading, deleteAplicativo } = useAplicativos();
  const { toast } = useToast();

  const handleEdit = (aplicativo: any) => {
    setEditingAplicativo(aplicativo);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aplicativo?')) {
      const { error } = await deleteAplicativo(id);
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir aplicativo",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Aplicativo excluído com sucesso",
        });
      }
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingAplicativo(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAplicativo(null);
  };

  if (showForm) {
    return (
      <AplicativosForm
        aplicativo={editingAplicativo}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aplicativos</CardTitle>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Aplicativo
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aplicativos.map((aplicativo) => (
                <TableRow key={aplicativo.id}>
                  <TableCell className="font-medium">{aplicativo.nome}</TableCell>
                  <TableCell>{aplicativo.descricao || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={aplicativo.ativo ? "default" : "secondary"}>
                      {aplicativo.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(aplicativo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(aplicativo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AplicativosList;
