import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleQuantityChange = (field: string, value: number) => {
    if (value > 10) {
      setShowLimitModal(true);
      return;
    }
    onUpdate(field, value);
  };
  return (
    <div className="border-t pt-6">
      <h3 className="text-base font-semibold mb-4">Abrangência</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <Label>Quantidade de Empresas (Matriz)</Label>
            <FieldSpeechButton
              fieldId="quantidadeEmpresas"
              label="Quantidade de Empresas"
              value={quantidadeEmpresas.toString()}
            />
          </div>
          <Input
            type="number"
            min="1"
            max="10"
            value={quantidadeEmpresas}
            onChange={(e) => handleQuantityChange('quantidadeEmpresas', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <Label>Quantidade de UFs</Label>
            <FieldSpeechButton
              fieldId="quantidadeUfs"
              label="Quantidade de UFs"
              value={quantidadeUfs.toString()}
            />
          </div>
          <Input
            type="number"
            min="1"
            max="10"
            value={quantidadeUfs}
            onChange={(e) => handleQuantityChange('quantidadeUfs', parseInt(e.target.value) || 1)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Modal de Limite Excedido */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Limite Excedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Verificamos que a quantidade informada ultrapassa o limite permitido neste formulário. 
              Para orçamentos com mais de 10 matrizes ou 10 UFs, nossa equipe comercial poderá oferecer 
              uma proposta personalizada.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Entre em contato:</p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>📧 comercial@sonda.com</p>
                <p>📞 (11) 3003-8888</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLimitModal(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbrangenciaFiscalSection;