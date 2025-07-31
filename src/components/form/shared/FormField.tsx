import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldSpeechButton } from '@/components/ui/field-speech-button';
import { formatCNPJ } from '@/utils/cnpjMask';
import { municipiosPorEstado } from '@/data/formOptions';

interface FormFieldProps {
  fieldName: string;
  config: any;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  dependentValue?: any; // Para campos que dependem de outros (ex: município depende de UF)
}

const FormField: React.FC<FormFieldProps> = ({
  fieldName,
  config,
  value,
  error,
  onChange,
  dependentValue
}) => {
  const fieldId = `field-${fieldName}`;

  const renderField = () => {
    switch (config.type) {
      case 'text':
      case 'email':
        return (
          <Input
            id={fieldId}
            type={config.type}
            value={value || ''}
            onChange={(e) => {
              let newValue = e.target.value;
              
              // Aplicar máscara para CNPJ
              if (fieldName === 'cnpj') {
                newValue = formatCNPJ(newValue);
              }
              
              onChange(newValue);
            }}
            placeholder={config.placeholder}
            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            }`}
          />
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            }`}
          />
        );

      case 'select':
        let options = config.options || [];
        
        // Para município, usar as opções baseadas na UF selecionada
        if (fieldName === 'municipio' && dependentValue) {
          options = municipiosPorEstado[dependentValue] || [];
        }

        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            }`}>
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {config.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldId}-${option.value}`}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentArray = value || [];
                    const newArray = checked
                      ? [...currentArray, option.value]
                      : currentArray.filter((item: string) => item !== option.value);
                    onChange(newArray);
                  }}
                />
                <Label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldId} className="text-gray-600 font-medium">
          {config.label} {config.required && <span className="text-red-500">*</span>}
        </Label>
        <FieldSpeechButton
          fieldId={fieldId}
          label={config.label}
          value={value}
        />
      </div>
      
      {renderField()}
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default FormField;