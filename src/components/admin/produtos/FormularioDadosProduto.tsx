
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DadoProdutoAno, useDadosProdutoAno } from '@/hooks/useDadosProdutoAno';
import { useAplicativos } from '@/hooks/useAplicativos';

interface DadosProdutoFormProps {
  dado?: DadoProdutoAno;
  onSave?: () => void;
  onCancel?: () => void;
}

const DadosProdutoForm: React.FC<DadosProdutoFormProps> = ({ dado, onSave, onCancel }) => {
  const [aplicativoId, setAplicativoId] = useState(dado?.aplicativo_id || '');
  const [ano, setAno] = useState(dado?.ano || new Date().getFullYear());
  const [calibracaoLu, setCalibracaoLu] = useState(dado?.calibracao_lu || 80.00);
  const [luMeses, setLuMeses] = useState(dado?.lu_meses || 12);
  const [luMaMinima, setLuMaMinima] = useState(dado?.lu_ma_minima || 30.00);
  const [margemVenda, setMargemVenda] = useState(dado?.margem_venda || 38.65);
  const [loading, setLoading] = useState(false);

  const { createDado, updateDado } = useDadosProdutoAno();
  const { aplicativos } = useAplicativos();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dados = {
        aplicativo_id: aplicativoId,
        ano,
        calibracao_lu: calibracaoLu,
        lu_meses: luMeses,
        lu_ma_minima: luMaMinima,
        margem_venda: margemVenda,
      };

      if (dado) {
        const { error } = await updateDado(dado.id, dados);
        if (error) {
          toast({
            title: "Erro",
            description: "Erro ao atualizar dados do produto",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Sucesso",
          description: "Dados do produto atualizados com sucesso",
        });
      } else {
        const { error } = await createDado(dados);
        if (error) {
          toast({
            title: "Erro",
            description: "Erro ao criar dados do produto",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Sucesso",
          description: "Dados do produto criados com sucesso",
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
        <CardTitle>{dado ? 'Editar Dados do Produto' : 'Novos Dados do Produto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aplicativo">Aplicativo *</Label>
            <Select value={aplicativoId} onValueChange={setAplicativoId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aplicativo" />
              </SelectTrigger>
              <SelectContent>
                {aplicativos.filter(app => app.ativo).map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ano">Ano *</Label>
            <Input
              id="ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <Label htmlFor="calibracao-lu" className="text-yellow-800">Calibração LU * (Editável)</Label>
              <Input
                id="calibracao-lu"
                type="number"
                step="0.01"
                value={calibracaoLu}
                onChange={(e) => setCalibracaoLu(parseFloat(e.target.value))}
                className="bg-yellow-100"
                required
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <Label htmlFor="lu-meses" className="text-yellow-800">LU Meses * (Editável)</Label>
              <Input
                id="lu-meses"
                type="number"
                value={luMeses}
                onChange={(e) => setLuMeses(parseInt(e.target.value))}
                className="bg-yellow-100"
                required
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <Label htmlFor="lu-ma-minima" className="text-yellow-800">LU MA Mínima * (Editável)</Label>
              <Input
                id="lu-ma-minima"
                type="number"
                step="0.01"
                value={luMaMinima}
                onChange={(e) => setLuMaMinima(parseFloat(e.target.value))}
                className="bg-yellow-100"
                required
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <Label htmlFor="margem-venda" className="text-yellow-800">Margem Venda % * (Editável)</Label>
              <Input
                id="margem-venda"
                type="number"
                step="0.01"
                value={margemVenda}
                onChange={(e) => setMargemVenda(parseFloat(e.target.value))}
                className="bg-yellow-100"
                required
              />
            </div>
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

export default DadosProdutoForm;
