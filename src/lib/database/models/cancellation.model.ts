import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";

const CancellationSchema = new Schema({
  canceledBooking: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Booking",
  },
  reasonOfCancellation:{
    type:String
  },
});

const Cancellations = models?.Cancellations || model("Cancellations", CancellationSchema);

export default Cancellations;