"use server";

import { revalidatePath } from "next/cache";

import Booking from "../database/models/booking.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { CreateBooking } from "../../../types";

// CREATE
export async function createBookings(booking: CreateBooking) {
  try {
    await connectToDatabase();

    const newContact = await Booking.create(booking);

    return JSON.parse(JSON.stringify(newContact));
  } catch (error) {
    handleError(error);
  }
}


// READ
export async function getBookingById(userId: string) {
  try {
    await connectToDatabase();

    const booking = await Booking.find({ author: userId });

    if (!booking) throw new Error("Booking not found");

    return JSON.parse(JSON.stringify(booking));
  } catch (error) {
    handleError(error);
  }
}


// CANCEL
export async function cancelBooking(bookingId: string, reasonOfCancellations : string) {
  try {
    await connectToDatabase();

    console.log(bookingId, reasonOfCancellations)
    const updatedCancellation = await Booking.findOneAndUpdate({ _id : bookingId}, { Cancellation: true, bookingStatus: 'Cancelled', reasonOfCancellation: reasonOfCancellations}, {
      new: true,
    });

    if (!updatedCancellation) throw new Error("Cancellation update failed");
    
    return JSON.parse(JSON.stringify(updatedCancellation));
  } catch (error) {
    handleError(error);
  }
}