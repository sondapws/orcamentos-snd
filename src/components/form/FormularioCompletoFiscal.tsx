import React, { useState } from 'react';
import { FormDataFiscal, Step1DataFiscal, Step2DataFiscal } from '@/types/formDataFiscal';
import FormularioComplyFiscal from './FormularioComplyFiscal';
import FormularioComplyFiscal2 from './FormularioComplyFiscal2';
import StepIndicator from './IndicadorEtapas';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Volume2, RotateCcw, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const FormularioCompletoFiscal: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReading, setIsReading] = useState(false);
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

  const handleTextToSpeech = () => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const text = document.body.innerText;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onend = () => setIsReading(false);
      speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const handleClearForm = () => {
    if (confirm('Tem certeza que deseja limpar todo o formulário?')) {
      setFormData({
        crm: '',
        razaoSocial: '',
        cnpj: '',
        municipio: '',
        uf: '',
        responsavel: '',
        email: '',
        segmento: '',
        escopo: [],
        quantidadeEmpresas: 1,
        quantidadeUfs: 1,
        volumetriaNotas: '',
        modalidade: '',
        prazoContratacao: 12,
        step: 1,
        completed: false
      });
      setCurrentStep(1);
    }
  };

  const openProductLink = () => {
    window.open('https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=comply&page=home', '_blank');
  };

  const openScopeLink = () => {
    window.open('https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=comply&page=escopoproduto', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background decorative elements */}
      <div className="fixed right-12 m-5 top-1/2 -translate-y-1/2 w-126 h-126 pointer-events-none z-0">
        <img
          src="/images/n-sonda-azul.png"
          alt="Background decoration"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Card flutuante que envolve todo o formulário */}
          <Card className="bg-white/90 shadow-lg border border-gray-200 rounded-lg overflow-hidden">
            {/* Header integrado no card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
              <div className="container mx-auto px-6 py-8 relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src="/images/logo-sonda.png"
                        alt="Sonda Logo"
                        className="w-35 h-20"
                      />
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <MoreHorizontal className="w-6 h-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleTextToSpeech}>
                        <Volume2 className="w-4 h-4 mr-2" />
                        {isReading ? 'Parar Leitura' : 'Leitura com Som'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleClearForm}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Limpar Formulário
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-4">Comply Fiscal</h1>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      onClick={openProductLink}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Conheça o nosso produto
                    </Button>

                    <Button
                      variant="outline"
                      onClick={openScopeLink}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Escopo do produto
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo do formulário */}
            <div className="p-8">
              <StepIndicator currentStep={currentStep} totalSteps={2} />

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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormularioCompletoFiscal;