import { useState, useCallback } from 'react';
import { getFieldConfig, validateField } from '@/data/formOptions';

interface UseFormFieldsProps {
  product: 'edocs' | 'fiscal';
  initialData?: Record<string, any>;
}

export const useFormFields = ({ product, initialData = {} }: UseFormFieldsProps) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((fieldName: string, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validar campo em tempo real
    const error = validateField(fieldName, value, product);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  }, [product]);

  const validateAllFields = useCallback((fieldsToValidate: string[]) => {
    const newErrors: Record<string, string> = {};
    
    fieldsToValidate.forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName], product);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data, product]);

  const getField = useCallback((fieldName: string) => {
    return getFieldConfig(fieldName, product);
  }, [product]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    data,
    errors,
    updateField,
    validateAllFields,
    getField,
    clearErrors,
    resetForm,
    setData,
    setErrors
  };
};

// Hook específico para campos do Step 1 (Identificação)
export const useStep1Fields = (product: 'edocs' | 'fiscal' = 'edocs') => {
  const step1Fields = ['crm', 'razaoSocial', 'cnpj', 'municipio', 'uf', 'responsavel', 'email'];
  
  const formFields = useFormFields({ product });
  
  const validateStep1 = useCallback(() => {
    return formFields.validateAllFields(step1Fields);
  }, [formFields]);

  return {
    ...formFields,
    validateStep1,
    step1Fields
  };
};

// Hook específico para campos do Step 2 (Questionário Técnico)
export const useStep2Fields = (product: 'edocs' | 'fiscal' = 'edocs') => {
  const baseStep2Fields = ['segmento', 'quantidadeEmpresas', 'quantidadeUfs', 'volumetriaNotas', 'modalidade', 'prazoContratacao'];
  
  // Adicionar campos específicos baseado no produto
  const step2Fields = product === 'fiscal' 
    ? [...baseStep2Fields, 'escopo']
    : [...baseStep2Fields, 'escopoInbound', 'escopoOutbound'];
  
  const formFields = useFormFields({ product });
  
  const validateStep2 = useCallback(() => {
    return formFields.validateAllFields(step2Fields);
  }, [formFields, step2Fields]);

  return {
    ...formFields,
    validateStep2,
    step2Fields
  };
};