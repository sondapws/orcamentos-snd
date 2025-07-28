
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-12">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : isCompleted 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                stepNumber
              )}
            </div>
            
            {stepNumber < totalSteps && (
              <div 
                className={`w-16 h-0.5 mx-3 transition-all duration-300 ${
                  isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                }`} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
