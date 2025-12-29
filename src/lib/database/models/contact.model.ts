import { Schema, model, models } from "mongoose";

const ContactSchema = new Schema({
  date: {
    type: Date || String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Contact = models?.Contact || model("Contact", ContactSchema);

export default Contact;