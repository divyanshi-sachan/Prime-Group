import { DollarSign } from 'lucide-react'

interface PaymentInfoProps {
  offeredPrice: number
  originalPrice: number
  paymentStatus: string
}

export function PaymentInfo({ offeredPrice, originalPrice, paymentStatus }: PaymentInfoProps) {
  return (
    <div className="space-y-2 mt-4">
      <h4 className="font-semibold">Payment Details</h4>
      { offeredPrice !== 0 &&
        <p className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="font-medium mr-2">Price:</span>
          <span className="line-through mr-2">₹{originalPrice.toLocaleString()}</span>
          ₹{offeredPrice.toLocaleString()}
        </p>
      }
      { offeredPrice === 0 &&
        <p className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="font-medium mr-2">Price:</span>
          <span className="mr-2">₹{originalPrice.toLocaleString()}</span>
        </p>
      }
      <p className="flex items-center">
        <span className="font-medium mr-2">Payment Status:</span>
        {paymentStatus}
      </p>
      {/* Add more payment details here if available */}
    </div>
  )
}

