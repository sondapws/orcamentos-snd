import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Step1DataFiscal } from '@/types/formDataFiscal';
import { formatCNPJ, validateCNPJ } from '@/utils/cnpjMask';
import { validateEmail } from '@/utils/emailValidation';
import { estadosBrasil, municipiosPorEstado } from '@/data/formOptions';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface FormStep1FiscalProps {
  data: Step1DataFiscal;
  onUpdate: (data: Partial<Step1DataFiscal>) => void;
  onNext: () => void;
}

const FormularioComplyFiscal: React.FC<FormStep1FiscalProps> = ({ data, onUpdate, onNext }) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Função para limpar erro específico quando campo é alterado
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Get municipalities for selected state and sort alphabetically
  const municipiosDisponiveis = data.uf
    ? (municipiosPorEstado[data.uf] || []).sort((a, b) => a.localeCompare(b, 'pt-BR'))
    : [];

  const handleEstadoChange = (value: string) => {
    // Clear municipality when state changes
    onUpdate({ uf: value, municipio: '' });
    clearFieldError('uf');
    clearFieldError('municipio');
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.razaoSocial.trim()) {
      newErrors.razaoSocial = 'Razão Social é obrigatória';
    }

    if (!data.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(data.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (!data.municipio.trim()) {
      newErrors.municipio = 'Município é obrigatório';
    }

    if (!data.uf) {
      newErrors.uf = 'Estado é obrigatório';
    }

    if (!data.responsavel.trim()) {
      newErrors.responsavel = 'Nome do responsável é obrigatório';
    }

    if (!data.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'E-mail inválido';
      console.log('E-mail rejeitado pela validação básica:', data.email);
    } else {
      console.log('E-mail aprovado:', data.email);
      // Garantir que não há erro de e-mail se passou na validação
      delete newErrors.email;
    }
    // Todos os e-mails válidos são aceitos - a lógica de aprovação é aplicada apenas no final

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      onNext();
    }
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    onUpdate({ cnpj: formatted });
    clearFieldError('cnpj');
  };

  return (
    <div className="form-step relative">
      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-500 text-sm">*</span>
            <span className="text-gray-600 text-sm">Obrigatória</span>
          </div>

          <h2 className="text-2xl font-bold text-blue-600 mb-2">Identificação</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* CRM Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="crm" className="text-gray-600 font-medium">CRM:</Label>
                <FieldSpeechButton
                  fieldId="crm"
                  label="CRM"
                  value={data.crm || ''}
                />
              </div>
              <Input
                id="crm"
                value={data.crm || ''}
                onChange={(e) => onUpdate({ crm: e.target.value })}
                placeholder="Insira sua resposta"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Razão Social Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="razaoSocial" className="text-gray-600 font-medium">
                  Razão Social <span className="text-red-500">*</span>
                </Label>
                <FieldSpeechButton
                  fieldId="razaoSocial"
                  label="Razão Social"
                  value={data.razaoSocial}
                />
              </div>
              <Input
                id="razaoSocial"
                value={data.razaoSocial}
                onChange={(e) => {
                  onUpdate({ razaoSocial: e.target.value });
                  clearFieldError('razaoSocial');
                }}
                placeholder="Insira sua resposta"
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.razaoSocial ? 'border-red-500' : ''
                  }`}
              />
              {errors.razaoSocial && (
                <p className="text-red-500 text-sm">{errors.razaoSocial}</p>
              )}
            </div>

            {/* CNPJ Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="cnpj" className="text-gray-600 font-medium">
                  CNPJ <span className="text-red-500">*</span>
                </Label>
                <FieldSpeechButton
                  fieldId="cnpj"
                  label="CNPJ"
                  value={data.cnpj}
                />
              </div>
              <Input
                id="cnpj"
                value={data.cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                placeholder="Insira sua resposta"
                maxLength={18}
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.cnpj ? 'border-red-500' : ''
                  }`}
              />
              {errors.cnpj && (
                <p className="text-red-500 text-sm">{errors.cnpj}</p>
              )}
            </div>

            {/* Location Fields - Localidade na mesma linha */}
            <div className="space-y-2">
              <div>
                <Label className="text-gray-600 font-medium">
                  Localização <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                {/* Estado Field */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm text-gray-600">Estado</Label>
                    <FieldSpeechButton
                      fieldId="estado"
                      label="Estado"
                      value={data.uf || ''}
                    />
                  </div>
                  <Select value={data.uf} onValueChange={handleEstadoChange}>
                    <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.uf ? 'border-red-500' : ''
                      }`}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasil.map(estado => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.uf && (
                    <p className="text-red-500 text-sm">{errors.uf}</p>
                  )}
                </div>

                {/* Município Field */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm text-gray-600">Município</Label>
                    <FieldSpeechButton
                      fieldId="municipio"
                      label="Município"
                      value={data.municipio || ''}
                    />
                  </div>
                  <Select
                    value={data.municipio}
                    onValueChange={(value) => {
                      onUpdate({ municipio: value });
                      clearFieldError('municipio');
                    }}
                    disabled={!data.uf}
                  >
                    <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.municipio ? 'border-red-500' : ''
                      }`}>
                      <SelectValue placeholder={data.uf ? "Selecione o município" : "Primeiro selecione o estado"} />
                    </SelectTrigger>
                    <SelectContent>
                      {municipiosDisponiveis.map(municipio => (
                        <SelectItem key={municipio} value={municipio}>
                          {municipio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.municipio && (
                    <p className="text-red-500 text-sm">{errors.municipio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Responsável Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="responsavel" className="text-gray-600 font-medium">
                  Responsável pelas Informações (Nome Completo) <span className="text-red-500">*</span>
                </Label>
                <FieldSpeechButton
                  fieldId="responsavel"
                  label="Responsável pelas Informações"
                  value={data.responsavel}
                />
              </div>
              <Input
                id="responsavel"
                value={data.responsavel}
                onChange={(e) => {
                  onUpdate({ responsavel: e.target.value });
                  clearFieldError('responsavel');
                }}
                placeholder="Insira sua resposta"
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.responsavel ? 'border-red-500' : ''
                  }`}
              />
              {errors.responsavel && (
                <p className="text-red-500 text-sm">{errors.responsavel}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="email" className="text-gray-600 font-medium">
                  E-mail Corporativo <span className="text-red-500">*</span>
                </Label>
                <FieldSpeechButton
                  fieldId="email"
                  label="E-mail Corporativo"
                  value={data.email}
                />
              </div>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => {
                  const email = e.target.value;
                  onUpdate({ email });
                  clearFieldError('email');
                }}
                placeholder="Insira um endereço de email"
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="flex justify-start pt-6">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium"
            >
              Avançar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioComplyFiscal;