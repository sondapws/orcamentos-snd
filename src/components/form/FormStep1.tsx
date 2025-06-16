
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, MapPin, User } from 'lucide-react';
import { Step1Data } from '@/types/formData';
import { formatCNPJ, validateCNPJ } from '@/utils/cnpjMask';
import { validateEmail, validateCorporateEmail } from '@/utils/emailValidation';
import { estadosBrasil } from '@/data/formOptions';

interface FormStep1Props {
  data: Step1Data;
  onUpdate: (data: Partial<Step1Data>) => void;
  onNext: () => void;
}

const FormStep1: React.FC<FormStep1Props> = ({ data, onUpdate, onNext }) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

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
    <div className="form-step">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Building2 className="w-6 h-6" />
            Identificação da Empresa
          </CardTitle>
          <CardDescription>
            Preencha os dados da sua empresa para gerar o orçamento personalizado
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="crm">CRM (opcional)</Label>
                <Input
                  id="crm"
                  value={data.crm || ''}
                  onChange={(e) => onUpdate({ crm: e.target.value })}
                  placeholder="Ex: CRM123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  id="razaoSocial"
                  value={data.razaoSocial}
                  onChange={(e) => onUpdate({ razaoSocial: e.target.value })}
                  placeholder="Nome completo da empresa"
                  className={errors.razaoSocial ? 'border-red-500' : ''}
                />
                {errors.razaoSocial && (
                  <p className="text-red-500 text-sm">{errors.razaoSocial}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={data.cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                placeholder="XX.XXX.XXX/XXXX-XX"
                maxLength={18}
                className={errors.cnpj ? 'border-red-500' : ''}
              />
              {errors.cnpj && (
                <p className="text-red-500 text-sm">{errors.cnpj}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="municipio">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Município *
                </Label>
                <Input
                  id="municipio"
                  value={data.municipio}
                  onChange={(e) => onUpdate({ municipio: e.target.value })}
                  placeholder="Nome do município"
                  className={errors.municipio ? 'border-red-500' : ''}
                />
                {errors.municipio && (
                  <p className="text-red-500 text-sm">{errors.municipio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">UF *</Label>
                <Select value={data.uf} onValueChange={(value) => onUpdate({ uf: value })}>
                  <SelectTrigger className={errors.uf ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">
                <User className="w-4 h-4 inline mr-1" />
                Responsável pelas Informações *
              </Label>
              <Input
                id="responsavel"
                value={data.responsavel}
                onChange={(e) => onUpdate({ responsavel: e.target.value })}
                placeholder="Nome completo do responsável"
                className={errors.responsavel ? 'border-red-500' : ''}
              />
              {errors.responsavel && (
                <p className="text-red-500 text-sm">{errors.responsavel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-1" />
                E-mail Corporativo *
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="exemplo@empresa.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
              <p className="text-sm text-gray-600">
                Utilize um e-mail corporativo da empresa
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Próxima Etapa
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormStep1;
