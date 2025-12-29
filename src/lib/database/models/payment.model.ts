import { Schema, model, models } from "mongoose";
import { number } from "zod";

const PaymentSchema = new Schema({
    amount: {
        type: Number || String,
        required: true,
    },
    orderCreationId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        required: true,
      },
    razorpayOrderId: {
        type: String,
        required: true,
      },
    razorpaySignature: {
        type: String,
        required: true,
      },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

const Payments = models?.Payments || model("Payments", PaymentSchema);

export default Payments;