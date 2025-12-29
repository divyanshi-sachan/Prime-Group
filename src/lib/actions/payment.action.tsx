"use server";

import Payments from "../database/models/payment.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import { PaymentParams } from "../../../types";

// CREATE
export async function createPayment(payment: PaymentParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(payment.userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newContact = await Payments.create({
        ...payment,
        author: author._id,
    });

    return JSON.parse(JSON.stringify(newContact));
  } catch (error) {
    handleError(error);
  }
}
