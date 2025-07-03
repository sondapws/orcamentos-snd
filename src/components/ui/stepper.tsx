import React from 'react';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export const Stepper = ({ currentStep, steps, className }: StepperProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  {
                    "bg-blue-600 text-white": isActive,
                    "bg-green-600 text-white": isCompleted,
                    "bg-gray-300 text-gray-600": !isActive && !isCompleted,
                  }
                )}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm font-medium",
                  {
                    "text-blue-600": isActive,
                    "text-green-600": isCompleted,
                    "text-gray-500": !isActive && !isCompleted,
                  }
                )}
              >
                {step}
              </span>
            </div>
            
            {stepNumber < steps.length && (
              <div
                className={cn(
                  "flex-1 h-px mx-4",
                  {
                    "bg-green-600": isCompleted,
                    "bg-gray-300": !isCompleted,
                  }
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};