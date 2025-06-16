
import React from 'react';
import { useFormData } from '@/hooks/useFormData';
import Header from '@/components/layout/Header';
import StepIndicator from './StepIndicator';
import FormStep1 from './FormStep1';
import FormStep2 from './FormStep2';

const QuoteForm: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep, completeForm } = useFormData();

  const handleStep1Update = (data: any) => {
    updateFormData(data);
  };

  const handleStep2Update = (data: any) => {
    updateFormData(data);
  };

  const handleFormSubmit = () => {
    completeForm();
    console.log('Formulário completo:', formData);
    // Aqui implementaremos a lógica de envio/cálculo
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <StepIndicator currentStep={formData.step} totalSteps={2} />

          {formData.step === 1 && (
            <FormStep1
              data={formData}
              onUpdate={handleStep1Update}
              onNext={nextStep}
            />
          )}

          {formData.step === 2 && (
            <FormStep2
              data={formData}
              onUpdate={handleStep2Update}
              onPrev={prevStep}
              onSubmit={handleFormSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteForm;
