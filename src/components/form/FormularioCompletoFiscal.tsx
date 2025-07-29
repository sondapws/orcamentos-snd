import React, { useState } from 'react';
import { FormDataFiscal, Step1DataFiscal, Step2DataFiscal } from '@/types/formDataFiscal';
import FormularioComplyFiscal from './FormularioComplyFiscal';
import FormularioComplyFiscal2 from './FormularioComplyFiscal2';

const FormularioCompletoFiscal: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataFiscal>({
    // Step 1 data
    crm: '',
    razaoSocial: '',
    cnpj: '',
    municipio: '',
    uf: '',
    responsavel: '',
    email: '',
    
    // Step 2 data
    segmento: '',
    escopo: [],
    quantidadeEmpresas: 1,
    quantidadeUfs: 1,
    volumetriaNotas: '',
    modalidade: '',
    prazoContratacao: 12,
    
    // Form control
    step: 1,
    completed: false
  });

  const updateStep1Data = (data: Partial<Step1DataFiscal>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const updateStep2Data = (data: Partial<Step2DataFiscal>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNextStep = () => {
    setCurrentStep(2);
    setFormData(prev => ({ ...prev, step: 2 }));
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setFormData(prev => ({ ...prev, step: 1 }));
  };

  const handleSubmit = () => {
    setFormData(prev => ({ ...prev, completed: true }));
    console.log('Formulário Comply Fiscal completo submetido:', formData);
    // Aqui você pode adicionar lógica adicional após o envio
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Comply Fiscal</h1>
          <p className="text-gray-600">Sistema de Gestão Fiscal e Tributária</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-sm text-gray-600">
              Passo {currentStep} de 2
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {currentStep === 1 ? (
            <FormularioComplyFiscal
              data={formData}
              onUpdate={updateStep1Data}
              onNext={handleNextStep}
            />
          ) : (
            <FormularioComplyFiscal2
              data={formData}
              formData={formData}
              onUpdate={updateStep2Data}
              onPrev={handlePrevStep}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FormularioCompletoFiscal;