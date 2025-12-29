import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Star } from 'lucide-react'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
}

export function ReviewModal({ isOpen, onClose, bookingId }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Your Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="w-8 h-8" fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-feedback">Feedback</Label>
            <Textarea
              id="review-feedback"
              placeholder="Share your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          {error && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            // onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

