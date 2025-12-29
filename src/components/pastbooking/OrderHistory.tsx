import { Search, Calendar, Link } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserById } from "@/lib/actions/user.actions"
import { getBookingById } from "@/lib/actions/booking.actions"
import { BookingDetailsCard } from './BookingCard'

export default async function BookingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  
  let user;
  try {
    user = await getUserById(userId);
  } catch (error) {
    console.error("Error fetching user:", error);
    // Handle user fetch error (e.g., show an error message)
    return <div>Error: Unable to fetch user data. Please try again later.</div>;
  }

  let bookings = [];
  try {
    const fetchedBookings = await getBookingById(user._id);
    console.log(fetchedBookings)
    bookings = Array.isArray(fetchedBookings) ? fetchedBookings : [fetchedBookings].filter(Boolean);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    // Handle booking fetch error (e.g., show an error message)
    return <div>Error: Unable to fetch booking data. Please try again later.</div>;
  }
   console.log(bookings)

  const pastBookings = bookings.filter(booking => booking.Cancellation === 'false');
  const cancelledBookings = bookings.filter(booking => booking.Cancellation === 'true');

  console.log(pastBookings);

  return (
    <div className="container mx-auto h-full p-4 sm:p-6 max-w-5xl mt-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Your Bookings</h1>
        <div className="flex w-full sm:w-auto gap-2">
          <Input
            type="search"
            placeholder="Search bookings..."
            className="w-full sm:w-[300px]"
          />
          <Button className="whitespace-nowrap">
            <Search className="w-4 h-4 mr-2 sm:mr-0 sm:hidden" />
            <span>Search</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="past" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="past" className="text-blue-600 flex-1 sm:flex-none">Past Bookings</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1 sm:flex-none">Cancelled Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="past" className="mt-6">
          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pastBookings.map((booking, index) => (
                  <BookingDetailsCard
                  email={booking.Email}
                  mobileNo={booking.MobileNo}
                  bookingid={booking._id}
                  bookingDate={booking.bookingDate}
                  bookingStatus={booking.bookingStatus}
                  bookingSubType={booking.bookingSubType}
                  bookingType={booking.bookingType}
                  country={booking.country}
                  firstName={booking.firstName}
                  lastName={booking.lastName}
                  landmark={booking.landmark}
                  location={booking.location}
                  offeredPrice={booking.offeredPrice}
                  originalPrice={booking.originalPrice}
                  paymentStatus={booking.paymentStatus}
                  zipcode={booking.zipcode}
                />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 sm:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">You have no past bookings</h2>
              <p className="text-gray-500 mb-6">Create your memories now.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-6">
          {cancelledBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {cancelledBookings.map((booking, index) => (
                <BookingDetailsCard
                email={booking.Email}
                mobileNo={booking.MobileNo}
                bookingid={booking._id}
                bookingDate={booking.bookingDate}
                bookingStatus={booking.bookingStatus}
                bookingSubType={booking.bookingSubType}
                bookingType={booking.bookingType}
                country={booking.country}
                firstName={booking.firstName}
                lastName={booking.lastName}
                landmark={booking.landmark}
                location={booking.location}
                offeredPrice={booking.offeredPrice}
                originalPrice={booking.originalPrice}
                paymentStatus={booking.paymentStatus}
                zipcode={booking.zipcode}
              />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 sm:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">You have no cancelled bookings</h2>
              <p className="text-gray-500 mb-6">All your cancelled bookings will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

