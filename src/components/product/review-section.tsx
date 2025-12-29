'use client'
import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ReviewStats } from "./review-stats"

interface Review {
  id: string
  author: string
  date: string
  rating: number
  content: string
}

const reviews: Review[] = [
  {
    id: '1',
    author: 'Jenna M.',
    date: '34 days ago',
    rating: 2,
    content: "The EcoBright 360 didn't live up to its promise of lasting 20,000 hours. Mine burnt out in less than 6 months with moderate use. Disappointed."
  },
  {
    id: '2',
    author: 'Gregory F.',
    date: '29 days ago',
    rating: 3,
    content: "While the energy savings are noticeable, the light emitted is a bit too harsh for my living room. Not quite the warm glow I was hoping for."
  },
  {
    id: '3',
    author: 'Samantha K.',
    date: '13 days ago',
    rating: 3,
    content: "Decent bulb for the price, but the smart features are a bit clunky to use. Sometimes it doesn't respond to the app as quickly as I'd like."
  },
  {
    id: '4',
    author: 'Alex P.',
    date: '8 days ago',
    rating: 4,
    content: "The app setup was a breeze, and I love being able to control the lighting from anywhere in the house. However, the bulb does not always connect to WiFi on the first try."
  },
  {
    id: '5',
    author: 'Michelle T.',
    date: '6 days ago',
    rating: 3,
    content: "This bulb is great for its price point. Energy-efficient and mostly reliable. Just wish it had better color temperature options."
  }
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "fill-primary stroke-primary" : "fill-muted stroke-muted-foreground"
          }`}
        />
      ))}
    </div>
  )
}

interface ReviewSectionProps {
  id: string;  // Accept the 'id' prop here
}

export default function ReviewSection({ id }: ReviewSectionProps) {  // Destructure 'id' from props
  return (
    <div id={id} className="container mx-auto p-4 mt-8 mb-8">  {/* Add 'id' to the container */}
      <h1 className="text-3xl font-bold mb-6">Customer Reviews</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[325px_1fr] gap-6">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ReviewStats />
        </div>
        <div>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted">
                        {review.author.split(' ')[0][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.author}</p>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-muted-foreground">{review.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
