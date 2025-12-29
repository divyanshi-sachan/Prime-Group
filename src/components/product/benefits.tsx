import { Leaf, Heart, Timer, Sparkles } from 'lucide-react'

export function Benefits() {
  const benefits = [
    {
      icon: Leaf,
      label: "Cleansing",
    },
    {
      icon: Heart,
      label: "Anti Inflammatory",
    },
    {
      icon: Timer,
      label: "Pre/During",
    },
    {
      icon: Sparkles,
      label: "Digestive Support",
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Benefits</h2>
      <div className="grid grid-cols-4 gap-4">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className="rounded-full border border-gray-200 p-3">
              <benefit.icon className="h-5 w-5" />
            </div>
            <span className="text-center text-sm">{benefit.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

