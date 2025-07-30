
import { useState, useEffect } from 'react';
import { FormData } from '@/types/formData';

const STORAGE_KEY = 'budget_form_data';

const initialFormData: FormData = {
  // Step 1
  crm: '',
  razaoSocial: '',
  cnpj: '',
  municipio: '',
  uf: '',
  responsavel: '',
  email: '',
  
  // Step 2
  segmento: '',
  escopoInbound: [],
  escopoOutbound: [],
  modelosNotas: [],
  cenariosNegocio: [],
  quantidadeEmpresas: 1,
  quantidadeUfs: 1,
  quantidadePrefeituras: 0,
  quantidadeConcessionarias: 0,
  quantidadeFaturas: 0,
  volumetriaNotas: '',
  modalidade: '',
  prazoContratacao: 12,
  
  // Meta
  step: 1,
  completed: false
};

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Always start with clean form on mount (similar to Comply Fiscal behavior)
  useEffect(() => {
    // Clear any saved data and start fresh
    localStorage.removeItem(STORAGE_KEY);
    setFormData(initialFormData);
  }, []);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    localStorage.removeItem(STORAGE_KEY);
  };

  const nextStep = () => {
    setFormData(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const prevStep = () => {
    setFormData(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const completeForm = () => {
    setFormData(prev => ({ ...prev, completed: true }));
  };

  return {
    formData,
    updateFormData,
    clearFormData,
    nextStep,
    prevStep,
    completeForm
  };
};
