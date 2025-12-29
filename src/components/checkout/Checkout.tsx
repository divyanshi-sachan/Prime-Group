'use client'

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { photographyPackages } from "@/components/data/packages";
import { GoogleMap , useJsApiLoader , StandaloneSearchBox } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { add, format } from "date-fns";
import { createPayment } from "@/lib/actions/payment.action"
import { CheckoutProps } from "../../../types"
import { createBookings } from "@/lib/actions/booking.actions"

export default function CheckoutPage(user : CheckoutProps) {
  const [date, setDate] = useState<Date | undefined >(new Date());
  const [payment, setPayment] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const locationref = useRef<HTMLDivElement | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>("Pre Wedding")
  const [currentPackage, setCurrentPackage] = useState<string>('0');
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [Landmark, setLandmark] = useState<string>("");
  const [address , setAddress]= useState('');
  const [Pincode, setPincode] = useState<string>("");
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<String>(`${user.user.email}`);
  const [firstName, setFirstname] = useState<String>(`${user.user.firstName}`);
  const [lastName, setLastname] = useState<String>(`${user.user.lastName}`);
  const [contact, setContact] = useState<String>("");
  console.log(user)
  console.log("New paymeent", payment);
  //@ts-ignore
  const catagory = photographyPackages[currentRoute]
  //@ts-ignore
  const packages = catagory.packages[currentPackage]

  useEffect(() => {
    const routeAttachment = new URLSearchParams(window.location.search).get("routeAttachment")
    const packageAttachment = new URLSearchParams(window.location.search).get("packages")
    if (routeAttachment) {
      setCurrentRoute(routeAttachment)
    }
    if (packageAttachment) {
      setCurrentPackage(packageAttachment)
    }
  }, [])

  const{isLoaded} = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
    libraries:["places"]
  })

  const handleOnPlaceChange = ()=>{
    //@ts-ignore
    setAddress(locationref.current.getPlaces());
  }

  const amount = packages.offerPrice ? (packages.offerPrice/2) : (packages.originalPrice/2)
  //Razorpay
  const createOrderId = async () => {
    try {
     const response = await fetch('/api/booking', {
      method: 'POST',
      headers: {
       'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        //@ts-ignore
       amount: parseFloat(packages.offerPrice ? (packages.offerPrice/2) : (packages.originalPrice/2))*100,
      })
     });
     
     if (!response.ok) {
      throw new Error('Network response was not ok');
     }

     setLoading(false);
     
     const data = await response.json();
     return data.orderId;
    } catch (error) {
     console.error('There was a problem with your fetch operation:', error);
    }
   };

   const processPayment = async () => {
    // e.preventDefault();
    try {
     const orderId: string = await createOrderId();
     const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY,
      //@ts-ignore
      amount: parseFloat(packages.offerPrice ? (packages.offerPrice/2) : (packages.originalPrice/2)) * 100,
      currency: currency,
      name: 'Memowries',
      description: 'description',
      order_id: orderId,
      handler: async function (response: any) {
       const data = {
        orderCreationId: orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
       };

       const result = await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
       });
       const res = await result.json();
       if (res.isOk){
        alert("payment succeed")
        //payment to mongodb
        try{
          const newPayment = await createPayment({amount: amount, userId: user.user._id,...data});
          console.log("New payment created successfully:", newPayment);

          //booking to mongodb
          try{
            const newBookig = await createBookings({
              author: user.user._id,
              bookingDate: date,
              firstName: firstName,
              lastName: lastName,
              Email: email,
              MobileNo: contact,
              originalPrice:packages.originalPrice,
              offeredPrice: packages.offerPrice ? packages.offerPrice : 0,
              country: selectedCountry,
              location: {
                type: "Point",
                //@ts-ignore
                coordinates: [address[0].geometry.viewport.Gh.hi, address[0].geometry.viewport.ei.hi],
              },
              landmark: Landmark,
              zipcode: Pincode,
              bookingType: catagory.title, 
              bookingSubType: packages.name,
              paymentDetails: newPayment._id,
              bookingStatus: "Initiated",
              paymentStatus: 'Successfully Paid 50% Deposit Before Shoot'
            });
            console.log("New booking created successfully:", newBookig);
            } catch (error) {
               console.log(error);
            }
          } catch (error) {
             console.log(error);
        }
      }
       else {
        alert(res.message);
       }
      },
      prefill: {
       name: firstName + " " + lastName,
       email: email,
       contact: contact,
      },
      theme: {
       color: '#3399cc',
      },
     };
     //@ts-ignore
     const paymentObject = new window.Razorpay(options);
     paymentObject.on('payment.failed', function (response: any) {
      alert(response.error.description);
     });
     paymentObject.open();
    } catch (error) {
     console.log(error);
    }
   };

  return (
    <div className="flex justify-center	min-h-screen bg-white p-4">
      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold mt-20">Customer details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" 
                    //@ts-ignore
                    value={email} required onChange={(e) => {setEmail(e.target.value)}}/>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First name *</Label>
                      <Input id="firstName" required 
                      //@ts-ignore
                      value={firstName} onChange={(e) => {setFirstname(e.target.value)}}/>
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name *</Label>
                      <Input id="lastName" required 
                      //@ts-ignore
                      value={lastName} onChange={(e) => {setLastname(e.target.value)}}/>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" required onChange={(e) => {setContact(e.target.value)}}/>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
              <h2 className="text-xl font-semibold">Booking details</h2>
              <div className="space-y-4">
                <div className="gap-4 sm:grid-cols-2 w-full items-center gap-1">
                  <div>
                    <Label htmlFor="picture">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                  <div>
                    <Label htmlFor="country">Country/Region *</Label>
                    <Select defaultValue="">
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent onSelect={(e)=>{
                        const target = e.target as HTMLSelectElement;
                        setSelectedCountry(target.value)}}>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    {isLoaded &&
                    <StandaloneSearchBox
                    //@ts-ignore
                    onLoad={(ref)=> locationref.current = ref}
                    onPlacesChanged={handleOnPlaceChange}>
                    <Input id="city" required />
                    </StandaloneSearchBox>
                    }
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                    <Label htmlFor="address">Landmark *</Label>
                    <Input id="address" required onChange={(e)=>{setLandmark(e.target.value)}}/>
                  </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP / Postal code *</Label>
                      <Input id="zipCode" required onChange={(e)=>{setPincode(e.target.value)}}/>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={(e) => {
                setLoading(true);
                //@ts-ignore
                processPayment(e);
                }}
                disabled={loading}
                >
                {loading ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      'Continue'
                    )}
              </Button>
            </div>
          </div>
          <div className="rounded-lg border p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="flex items-center justify-between text-lg font-semibold">
                  Order summary <span className="text-muted-foreground">(1)</span>
                </h2>
                <Separator />
                <div className="flex items-start space-x-4">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{catagory.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      <b>Package Name:</b> {packages.name}
                    </p>
                    <button className="text-sm text-muted-foreground text-left hover:text-foreground"
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                      More Details <ChevronDown className={`ml-1 inline-block h-4 w-4 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                      {isDetailsOpen && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          {packages.features.map((feature : string, index : number) => (
                            <p key={index} className="text-left">{feature}</p>
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    { packages.offerPrice && (
                    <span className="font-medium">₹{(packages.offerPrice).toLocaleString()}</span>
                    )}
                    { !packages.offerPrice && (
                    <span className="font-medium">₹{(packages.originalPrice).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  { packages.offerPrice && (
                  <span>₹{(packages.offerPrice).toLocaleString()}</span>
                  )}
                   { !packages.offerPrice && (
                  <span>₹{(packages.originalPrice).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span>1st Payment (50% Deposit Before Shoot)</span>
                  { packages.offerPrice && (
                  <span>₹{(packages.offerPrice/2).toLocaleString()}</span>
                  )}
                   {!packages.offerPrice && (
                  <span>₹{(packages.originalPrice/2).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span>2nd Payment (Due amount After Shoot)</span>
                  {packages.offerPrice && (
                  <span>₹{(packages.offerPrice/2).toLocaleString()}</span>
                  )}
                   {!packages.offerPrice && (
                  <span>₹{(packages.originalPrice/2).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sales Tax</span>
                  <span>--</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount Due Now</span>
                  {packages.offerPrice && (
                  <span>₹{(packages.offerPrice/2).toLocaleString()}</span>
                  )}
                   {!packages.offerPrice && (
                  <span>₹{(packages.originalPrice/2).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>*Please make the 1st payment to confirm your booking.</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>*The remaining balance will be due after the shoot.</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}