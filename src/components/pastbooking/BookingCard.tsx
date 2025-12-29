'use client'

import { useState } from 'react'
import { CalendarDays, MapPin, Phone, Mail, DollarSign, CheckCircle, AlertCircle, User, Package, Star, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { CancellationModal } from "./CancellationModal"
import { ReviewModal } from "./ReviewModal"
import { BookingStatusStages } from "./BookingStatusStages"

interface BookingDetailsProps {
  email: string;
  mobileNo: string;
  bookingid: string;
  bookingDate: string;
  bookingStatus: string;
  bookingSubType: string;
  bookingType: string;
  country: string;
  firstName: string;
  lastName: string;
  landmark: string;
  location: {
    coordinates: [number, number];
    type: string;
  };
  offeredPrice: number;
  originalPrice: number;
  paymentStatus: string;
  zipcode: string;
}

export function BookingDetailsCard({
  email,
  mobileNo,
  bookingid,
  bookingDate,
  bookingStatus,
  bookingSubType,
  bookingType,
  country,
  firstName,
  lastName,
  landmark,
  location,
  offeredPrice,
  originalPrice,
  paymentStatus,
  zipcode
}: BookingDetailsProps) {
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  return (
    <Card className="w-full max-w-5xl mx-auto h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="md:flex items-center gap-4">
            <CardTitle className="text-xl md:text-2xl font-bold">{bookingType} - {bookingSubType}</CardTitle>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
            <button className="flex items-center focus:outline-none">
              <Info className='text-gray-400'/>
            </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Booking Information</h4>
                <p className="text-sm">
                  <span className="font-medium">Id: </span>
                  {bookingid}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Payment Status: </span>
                  {paymentStatus}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* <h3 className="text-lg font-semibold mb-2">Booking Information</h3> */}
            <div className="space-y-2">
              <p className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                {new Date(bookingDate).toLocaleString()}
              </p>
              {offeredPrice !== 0 && (
                <p className="flex items-center">
                  <span className="font-medium mr-2">Price:</span>
                  <span className="line-through mr-2">₹{originalPrice.toLocaleString()}</span>
                  ₹{offeredPrice.toLocaleString()}
                </p>
              )}
              {offeredPrice === 0 && (
                <p className="flex items-center">
                  <span className="font-medium mr-2">Price:</span>
                  <span className="mr-2">₹{originalPrice.toLocaleString()}</span>
                </p>
              )}
              <div className="flex items-center">
                <span className="font-medium mr-2">Status:</span>
                <BookingStatusStages currentStatus={bookingStatus} />
              </div>
            </div>
          </div>
          <div>
            {/* <h3 className="text-lg font-semibold mb-2">Personal Information</h3> */}
            <div className="space-y-2">
              <p className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {firstName} {lastName}
              </p>
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {email}
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {mobileNo}
              </p>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Location Details</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {landmark} 
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Country:</span>
                {country || "Not specified"}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Zipcode:</span>
                {zipcode}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline"
          className='mx-2'
          onClick={() => setIsReviewModalOpen(true)}
          disabled={bookingStatus !== "Completed"}
        >
          <Star className="w-4 h-4 mr-2" />
          Review
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => setIsCancellationModalOpen(true)}
          disabled={bookingStatus === "Cancelled"}
        >
          Cancel Booking
        </Button>
      </CardFooter>
      <CancellationModal 
        isOpen={isCancellationModalOpen} 
        onClose={() => setIsCancellationModalOpen(false)}
        bookingId={bookingid}
      />
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)}
        bookingId={bookingid}
      />
    </Card>
  )
}

