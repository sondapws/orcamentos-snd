
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Step1Data } from '@/types/formData';
import { formatCNPJ, validateCNPJ } from '@/utils/cnpjMask';
import { validateEmail, validateCorporateEmail } from '@/utils/emailValidation';
import { estadosBrasil, municipiosPorEstado } from '@/data/formOptions';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';

interface FormStep1Props {
  data: Step1Data;
  onUpdate: (data: Partial<Step1Data>) => void;
  onNext: () => void;
}

const FormStep1: React.FC<FormStep1Props> = ({ data, onUpdate, onNext }) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Get municipalities for selected state and sort alphabetically
  const municipiosDisponiveis = data.uf 
    ? (municipiosPorEstado[data.uf] || []).sort((a, b) => a.localeCompare(b, 'pt-BR'))
    : [];
  
  const handleEstadoChange = (value: string) => {
    // Clear municipality when state changes
    onUpdate({ uf: value, municipio: '' });
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
    } else if (!validateCorporateEmail(data.email)) {
      newErrors.email = 'Utilize um e-mail corporativo';
    }

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
    
    if (errors.cnpj && validateCNPJ(formatted)) {
      setErrors(prev => ({ ...prev, cnpj: '' }));
    }
  };

  return (
    <div className="form-step relative">
      {/* Background decorative elements */}
      <div className="fixed right-12 top-1/2 -translate-y-1/2 w-96 h-96 opacity-10 pointer-events-none z-0">
        <img 
          src="/images/n-sonda-azul.png" 
          alt="Background decoration"
          className="w-full h-full object-contain"
        />
      </div>

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
                <Label htmlFor="crm" className="text-gray-700 font-medium">CRM:</Label>
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
                <Label htmlFor="razaoSocial" className="text-gray-700 font-medium">
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
                onChange={(e) => onUpdate({ razaoSocial: e.target.value })}
                placeholder="Insira sua resposta"
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.razaoSocial ? 'border-red-500' : ''
                }`}
              />
              {errors.razaoSocial && (
                <p className="text-red-500 text-sm">{errors.razaoSocial}</p>
              )}
            </div>

            {/* CNPJ Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="cnpj" className="text-gray-700 font-medium">
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
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.cnpj ? 'border-red-500' : ''
                }`}
              />
              {errors.cnpj && (
                <p className="text-red-500 text-sm">{errors.cnpj}</p>
              )}
            </div>

            {/* Location Fields - Estado e Município na mesma linha */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-gray-700 font-medium">
                  Localização (Estado/Município) <span className="text-red-500">*</span>
                </Label>
                <FieldSpeechButton
                  fieldId="localizacao"
                  label="Localização"
                  value={data.uf && data.municipio ? `${data.uf} - ${data.municipio}` : data.uf || data.municipio || ''}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Estado Field */}
                <div>
                  <Select value={data.uf} onValueChange={handleEstadoChange}>
                    <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.uf ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Estado" />
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
                  <Select 
                    value={data.municipio} 
                    onValueChange={(value) => onUpdate({ municipio: value })}
                    disabled={!data.uf}
                  >
                    <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.municipio ? 'border-red-500' : ''
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
                <Label htmlFor="responsavel" className="text-gray-700 font-medium">
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
                onChange={(e) => onUpdate({ responsavel: e.target.value })}
                placeholder="Insira sua resposta"
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.responsavel ? 'border-red-500' : ''
                }`}
              />
              {errors.responsavel && (
                <p className="text-red-500 text-sm">{errors.responsavel}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
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
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="Insira um endereço de email"
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : ''
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

export default FormStep1;
