
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`step-indicator ${
                isActive ? 'active' : isCompleted ? 'completed' : 'inactive'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                stepNumber
              )}
            </div>
            
            {stepNumber < totalSteps && (
              <div 
                className={`w-12 h-0.5 mx-2 ${
                  isCompleted ? 'bg-success' : 'bg-gray-300'
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
