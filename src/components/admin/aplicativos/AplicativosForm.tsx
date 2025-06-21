
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Aplicativo, useAplicativos } from '@/hooks/useAplicativos';

interface AplicativosFormProps {
  aplicativo?: Aplicativo;
  onSave?: () => void;
  onCancel?: () => void;
}

const AplicativosForm: React.FC<AplicativosFormProps> = ({ aplicativo, onSave, onCancel }) => {
  const [nome, setNome] = useState(aplicativo?.nome || '');
  const [descricao, setDescricao] = useState(aplicativo?.descricao || '');
  const [ativo, setAtivo] = useState(aplicativo?.ativo ?? true);
  const [loading, setLoading] = useState(false);

  const { createAplicativo, updateAplicativo } = useAplicativos();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dados = { nome, descricao, ativo };

      if (aplicativo) {
        const { error } = await updateAplicativo(aplicativo.id, dados);
        if (error) {
          toast({
            title: "Erro",
            description: "Erro ao atualizar aplicativo",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Sucesso",
          description: "Aplicativo atualizado com sucesso",
        });
      } else {
        const { error } = await createAplicativo(dados);
        if (error) {
          toast({
            title: "Erro",
            description: "Erro ao criar aplicativo",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Sucesso",
          description: "Aplicativo criado com sucesso",
        });
      }

      onSave?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{aplicativo ? 'Editar Aplicativo' : 'Novo Aplicativo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={setAtivo}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AplicativosForm;
