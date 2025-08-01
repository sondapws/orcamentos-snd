
import React, { useState } from 'react';
import { useFormData } from '@/hooks/useFormData';
import StepIndicator from './IndicadorEtapas';
import FormStep1 from './FormularioComplyEDocs';
import FormStep2 from './FormularioComplyEDocs2';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Volume2, RotateCcw, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { isSondaEmail } from '@/utils/emailValidation';
import { approvalService } from '@/services/approvalService';

const QuoteForm: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep, completeForm, clearFormData } = useFormData();
  const [isReading, setIsReading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleStep1Update = (data: any) => {
    updateFormData(data);
  };

  const handleStep2Update = (data: any) => {
    updateFormData(data);
  };

  const handleFormSubmit = async () => {
    // O orçamento já foi processado pelo FormularioComplyEDocs2
    // Aqui apenas finalizamos o fluxo do formulário
    completeForm();
    console.log('Formulário completo e orçamento enviado:', {
      razaoSocial: formData.razaoSocial,
      email: formData.email,
      step: formData.step
    });
    
    // Aguardar um pouco para o usuário ver o toast de sucesso
    setTimeout(() => {
      console.log('Limpando formulário e voltando ao início...');
      clearFormData();
    }, 2000);
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
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    clearFormData();
  };

  const openProductLink = () => {
    window.open('https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=complyedocs&page=home', '_blank');
  };

  const openScopeLink = () => {
    window.open('https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=complyedocs&page=escopoproduto', '_blank');
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
                        className="w-25 h-10"
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
                  <h1 className="text-3xl font-bold mb-4">Orçamento Comply e-DOCS</h1>

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
                  formData={formData}
                  onUpdate={handleStep2Update}
                  onPrev={prevStep}
                  onSubmit={handleFormSubmit}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de confirmação para limpar formulário */}
      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClear}
        title="Limpar Formulário"
        description="Tem certeza que deseja limpar todo o formulário? Todos os dados preenchidos serão perdidos e não poderão ser recuperados."
        confirmText="Sim, limpar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default QuoteForm;
