interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
  }
  
  export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${i < currentStep 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : i === currentStep 
                    ? 'border-primary text-primary' 
                    : 'border-gray-200 text-gray-400'
                }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative w-full h-2 bg-gray-100 rounded-full">
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>
    )
  }
  
  