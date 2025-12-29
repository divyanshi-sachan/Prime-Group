import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import { cancelBooking } from '@/lib/actions/booking.actions'

interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
}

export function CancellationModal({ isOpen, onClose, bookingId }: CancellationModalProps) {
  const [reason, setReason] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Your Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cancellation-reason" >Reason for Cancellation</Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please provide a reason for cancelling your booking..."
              className='mt-2'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
            variant="destructive" 
            onClick={()=>{cancelBooking(bookingId, reason)}}
            disabled={isConfirming}
          >
            {isConfirming ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
