import { Check, Clock, X} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const stages = [
  { name: 'Initiated', icon: Clock },
  { name: 'Confirmed', icon: Check },
  { name: 'In Progress', icon: Clock },
  { name: 'Completed', icon: Check },
]

const Cancelestages = [
    { name: 'Initiated', icon: Clock },
    { name: 'Cancelled', icon: X },
  ]

export function BookingStatusStages({ currentStatus }: { currentStatus: string }) {
  const currentStageIndex = stages.findIndex(stage => stage.name === currentStatus)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center focus:outline-none">
          <Badge variant={currentStatus === "Initiated" ? "default" : "secondary"}>
            {currentStatus}
          </Badge>
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-md p-4">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStageIndex ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {index < currentStageIndex ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <stage.icon className="w-5 h-5" />
                )}
              </div>
              <div className="h-1 w-full bg-gray-200 mt-2">
                <div 
                  className="h-full bg-gray-800 transition-all duration-300 ease-in-out"
                  style={{ width: `${index <= currentStageIndex ? 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs mt-1 text-center p-2">{stage.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

