import { Star } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface RatingBreakdown {
  stars: number
  percentage: number
}

const ratingStats = {
  average: 4.2,
  totalReviews: 7082,
  breakdown: [
    { stars: 5, percentage: 53 },
    { stars: 4, percentage: 29 },
    { stars: 3, percentage: 8 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 7 },
  ]
}

export function ReviewStats() {
  return (
    <Card className="w-full">
      <CardContent className="grid gap-4 p-6">
        <h2 className="text-2xl font-semibold">Overall Rating</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{ratingStats.average}</span>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(ratingStats.average) 
                    ? "fill-primary stroke-primary" 
                    : "fill-muted stroke-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {ratingStats.totalReviews.toLocaleString()} global ratings
        </div>

        <div className="space-y-1">
          {ratingStats.breakdown.map((rating) => (
            <div key={rating.stars} className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {rating.stars} star
              </div>
              <Progress value={rating.percentage} className="h-2" />
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {rating.percentage}%
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="text-sm">
          <p className="font-medium mb-1">How are ratings calculated?</p>
          <p className="text-muted-foreground text-xs">
            To calculate the overall star rating and percentage breakdown by star, we don't use a simple average. 
            Instead, our system considers things like how recent a review is and if the reviewer bought the item. 
            It also analyses reviews to verify trustworthiness.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

