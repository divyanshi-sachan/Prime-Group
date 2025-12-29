"use server";

import Subscribe from "../database/models/subscribe.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { SubscribeParams } from "../../../types";

// CREATE
export async function createSubscribe(subscribe : SubscribeParams) {
  try {
    await connectToDatabase();

    const newSubscribe = await Subscribe.create(subscribe);

    return JSON.parse(JSON.stringify(newSubscribe));
  } catch (error) {
    handleError(error);
  }
}
