import { Schema, model, models } from "mongoose";

const subscribeSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

const Subscribe = models?.Subscribe || model("Subscribe", subscribeSchema);
export default Subscribe;