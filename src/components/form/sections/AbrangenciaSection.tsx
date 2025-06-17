
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AbrangenciaSectionProps {
  quantidadeEmpresas: number;
  quantidadeUfs: number;
  onUpdate: (field: string, value: number) => void;
}

const AbrangenciaSection: React.FC<AbrangenciaSectionProps> = ({
  quantidadeEmpresas,
  quantidadeUfs,
  onUpdate
}) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Abrangência</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantidadeEmpresas">Quantidade de Empresas (Matriz)</Label>
          <Input
            id="quantidadeEmpresas"
            type="number"
            min="1"
            value={quantidadeEmpresas}
            onChange={(e) => onUpdate('quantidadeEmpresas', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidadeUfs">Quantidade de UFs</Label>
          <Input
            id="quantidadeUfs"
            type="number"
            min="1"
            max="27"
            value={quantidadeUfs}
            onChange={(e) => onUpdate('quantidadeUfs', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default AbrangenciaSection;
