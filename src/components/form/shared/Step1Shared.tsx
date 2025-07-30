import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useStep1Fields } from '@/hooks/useFormFields';
import FormField from './FormField';

interface Step1SharedProps {
  product: 'edocs' | 'fiscal';
  initialData?: any;
  onNext: (data: any) => void;
  title?: string;
  subtitle?: string;
}

const Step1Shared: React.FC<Step1SharedProps> = ({
  product,
  initialData = {},
  onNext,
  title = 'Identificação',
  subtitle = 'Informe os dados da sua empresa'
}) => {
  const {
    data,
    errors,
    updateField,
    validateStep1,
    getField,
    step1Fields
  } = useStep1Fields(product);

  // Inicializar dados se fornecidos
  React.useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      Object.entries(initialData).forEach(([key, value]) => {
        updateField(key, value);
      });
    }
  }, [initialData, updateField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      onNext(data);
    }
  };

  return (
    <div className="form-step">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500 text-sm">*</span>
          <span className="text-gray-600 text-sm">Obrigatória</span>
        </div>

        <h2 className="text-2xl font-bold text-blue-600 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {step1Fields.map((fieldName) => {
            const config = getField(fieldName);
            if (!config) return null;

            return (
              <FormField
                key={fieldName}
                fieldName={fieldName}
                config={config}
                value={data[fieldName]}
                error={errors[fieldName]}
                onChange={(value) => updateField(fieldName, value)}
                dependentValue={fieldName === 'municipio' ? data.uf : undefined}
              />
            );
          })}
        </div>

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8"
            size="lg"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step1Shared;