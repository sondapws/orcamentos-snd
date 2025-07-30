
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
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Escopo *</h3>
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => {
            const text = "Escopo do produto. Inbound: Entrada de documentos eletrônicos no sistema da empresa, normalmente enviados por fornecedores. Outbound: Saída de documentos eletrônicos do sistema da empresa, normalmente enviados para clientes.";
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            speechSynthesis.speak(utterance);
          }}
          title="Leitura avançada"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.078-1.343-4.243a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.829 1 1 0 11-1.415-1.414A3.987 3.987 0 0013 12a3.987 3.987 0 00-.172-1.415 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
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
