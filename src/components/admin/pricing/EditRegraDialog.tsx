import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegrasPrecificacao } from '@/hooks/useRegrasPrecificacao';
import { Edit } from 'lucide-react';

interface EditRegraDialogProps {
  regra: any;
}

const EditRegraDialog = ({ regra }: EditRegraDialogProps) => {
  const { atualizarRegra } = useRegrasPrecificacao();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    margem_venda: regra.margem_venda || 0,
    receita_mensal: regra.receita_mensal || 0,
    custo_mensal: regra.custo_mensal || 0,
    qtd_clientes: regra.qtd_clientes || 0,
  });

  useEffect(() => {
    setFormData({
      margem_venda: regra.margem_venda || 0,
      receita_mensal: regra.receita_mensal || 0,
      custo_mensal: regra.custo_mensal || 0,
      qtd_clientes: regra.qtd_clientes || 0,
    });
  }, [regra]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSalvar = async () => {
    await atualizarRegra(regra.id, formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          title="Editar dados básicos"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Editar Regra - {regra.aplicativos?.nome} ({regra.ano})
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="margem_venda" className="text-right">
              Margem Venda (%)
            </Label>
            <Input
              id="margem_venda"
              type="number"
              step="0.01"
              value={formData.margem_venda}
              onChange={(e) => handleInputChange('margem_venda', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receita_mensal" className="text-right">
              Receita Mensal (R$)
            </Label>
            <Input
              id="receita_mensal"
              type="number"
              step="0.01"
              value={formData.receita_mensal}
              onChange={(e) => handleInputChange('receita_mensal', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custo_mensal" className="text-right">
              Custo Mensal (R$)
            </Label>
            <Input
              id="custo_mensal"
              type="number"
              step="0.01"
              value={formData.custo_mensal}
              onChange={(e) => handleInputChange('custo_mensal', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qtd_clientes" className="text-right">
              Qtd Clientes
            </Label>
            <Input
              id="qtd_clientes"
              type="number"
              value={formData.qtd_clientes}
              onChange={(e) => handleInputChange('qtd_clientes', e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRegraDialog;