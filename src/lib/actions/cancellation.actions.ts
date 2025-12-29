"use server";

import { revalidatePath } from "next/cache";

import Cancellations from "../database/models/cancellation.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createCancellation(bookingId: string, reasonOfCancellations : string ) {
  try {
    await connectToDatabase();

    const newCancellation = await Cancellations.create({canceledBooking: bookingId, reasonOfCancellation: reasonOfCancellations});

    return JSON.parse(JSON.stringify(newCancellation));
  } catch (error) {
    handleError(error);
  }
}
