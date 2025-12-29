import mongoose from "mongoose";
import { Schema, model, models } from "mongoose";

const packageSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    features: [{
        type: String,
    }],
}, { _id: false });

const serciveSubCatagorySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    oneline: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    packages: [packageSchema],
}, { timestamps: true });

const serciveCatagorySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    subCatagory: [serciveSubCatagorySchema],
}, { timestamps: true });

const ServiceCatagory = models?.ServiceCatagory || model("ServiceCatagory", serciveCatagorySchema);

export default ServiceCatagory;
