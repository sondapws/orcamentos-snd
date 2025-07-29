import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface AbrangenciaFiscalSectionProps {
  quantidadeEmpresas: number;
  quantidadeUfs: number;
  onUpdate: (field: string, value: any) => void;
}

const AbrangenciaFiscalSection: React.FC<AbrangenciaFiscalSectionProps> = ({
  quantidadeEmpresas,
  quantidadeUfs,
  onUpdate
}) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Abrangência</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Quantidade de Empresas (Matriz) *</Label>
            <FieldSpeechButton
              fieldId="quantidadeEmpresas"
              label="Quantidade de Empresas"
              value={quantidadeEmpresas.toString()}
            />
          </div>
          <Input
            type="number"
            min="1"
            value={quantidadeEmpresas}
            onChange={(e) => onUpdate('quantidadeEmpresas', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Quantidade de UFs *</Label>
            <FieldSpeechButton
              fieldId="quantidadeUfs"
              label="Quantidade de UFs"
              value={quantidadeUfs.toString()}
            />
          </div>
          <Input
            type="number"
            min="1"
            max="27"
            value={quantidadeUfs}
            onChange={(e) => onUpdate('quantidadeUfs', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500">
            Abrangência de UFs da operação, visando entendimento das obrigações estaduais necessárias e outras necessidades por UF
          </p>
        </div>
      </div>
    </div>
  );
};

export default AbrangenciaFiscalSection;