"use server";

import { revalidatePath } from "next/cache";

import Contact from "../database/models/contact.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { CreateContactParams } from "../../../types";

// CREATE
export async function createContact(contact: CreateContactParams) {
  try {
    await connectToDatabase();

    const newContact = await Contact.create(contact);

    return JSON.parse(JSON.stringify(newContact));
  } catch (error) {
    handleError(error);
  }
}
