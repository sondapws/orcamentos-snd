
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { escopoInboundOptions, escopoOutboundOptions } from '@/data/formOptions';

interface ScopeSelectorProps {
  escopoInbound: string[];
  escopoOutbound: string[];
  quantidadePrefeiturasInbound: number;
  quantidadePrefeiturasOutbound: number;
  quantidadeConcessionarias: number;
  quantidadeFaturas: number;
  onCheckboxChange: (field: string, value: string, checked: boolean) => void;
  onQuantidadeChange: (field: string, value: number) => void;
  error?: string;
}

const ScopeSelector: React.FC<ScopeSelectorProps> = ({
  escopoInbound,
  escopoOutbound,
  quantidadePrefeiturasInbound,
  quantidadePrefeiturasOutbound,
  quantidadeConcessionarias,
  quantidadeFaturas,
  onCheckboxChange,
  onQuantidadeChange,
  error
}) => {
  const hasNfseInbound = escopoInbound.includes('nfse');
  const hasNfseOutbound = escopoOutbound.includes('nfse');
  const hasFaturas = escopoInbound.includes('faturas');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Escopo</h3>
      
      {/* Escopo Inbound */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Inbound</Label>
          <p className="text-sm text-gray-600 mt-1">
            Entrada de documentos eletrônicos no sistema da empresa, normalmente enviados por fornecedores.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {escopoInboundOptions.map(option => (
            <div key={`inbound-${option.value}`}>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`inbound-${option.value}`}
                  checked={escopoInbound.includes(option.value)}
                  onCheckedChange={(checked) => 
                    onCheckboxChange('escopoInbound', option.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`inbound-${option.value}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              
              {/* Campo condicional para NFS-e Inbound */}
              {option.value === 'nfse' && hasNfseInbound && (
                <div className="mt-3 ml-6">
                  <Label htmlFor="quantidadePrefeiturasInbound" className="text-sm">
                    Quantidade de Prefeituras (Inbound)
                  </Label>
                  <Input
                    id="quantidadePrefeiturasInbound"
                    type="number"
                    min="0"
                    value={quantidadePrefeiturasInbound}
                    onChange={(e) => onQuantidadeChange('quantidadePrefeiturasInbound', parseInt(e.target.value) || 0)}
                    className="mt-1 w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Campos condicionais para Faturas */}
              {option.value === 'faturas' && hasFaturas && (
                <div className="mt-3 ml-6 space-y-3">
                  <div>
                    <Label htmlFor="quantidadeConcessionarias" className="text-sm">
                      Quantidade de Concessionárias
                    </Label>
                    <Input
                      id="quantidadeConcessionarias"
                      type="number"
                      min="0"
                      value={quantidadeConcessionarias}
                      onChange={(e) => onQuantidadeChange('quantidadeConcessionarias', parseInt(e.target.value) || 0)}
                      className="mt-1 w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidadeFaturas" className="text-sm">
                      Quantidade de Faturas
                    </Label>
                    <Input
                      id="quantidadeFaturas"
                      type="number"
                      min="0"
                      value={quantidadeFaturas}
                      onChange={(e) => onQuantidadeChange('quantidadeFaturas', parseInt(e.target.value) || 0)}
                      className="mt-1 w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Escopo Outbound */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Outbound</Label>
          <p className="text-sm text-gray-600 mt-1">
            Emissão ou envio de documentos eletrônicos pela empresa, geralmente para clientes ou órgãos reguladores.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {escopoOutboundOptions.map(option => (
            <div key={`outbound-${option.value}`}>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`outbound-${option.value}`}
                  checked={escopoOutbound.includes(option.value)}
                  onCheckedChange={(checked) => 
                    onCheckboxChange('escopoOutbound', option.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`outbound-${option.value}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              
              {/* Campo condicional para NFS-e Outbound */}
              {option.value === 'nfse' && hasNfseOutbound && (
                <div className="mt-3 ml-6">
                  <Label htmlFor="quantidadePrefeiturasOutbound" className="text-sm">
                    Quantidade de Prefeituras (Outbound)
                  </Label>
                  <Input
                    id="quantidadePrefeiturasOutbound"
                    type="number"
                    min="0"
                    value={quantidadePrefeiturasOutbound}
                    onChange={(e) => onQuantidadeChange('quantidadePrefeiturasOutbound', parseInt(e.target.value) || 0)}
                    className="mt-1 w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default ScopeSelector;
