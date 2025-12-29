import { Check } from 'lucide-react'

interface FeaturesProps {
    features : string[];
  }

export function Features({ features } : FeaturesProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Features</h2>
      <div className="grid gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-1">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{feature}</h3>
              {/* <p className="text-sm text-gray-600">{feature.description}</p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

