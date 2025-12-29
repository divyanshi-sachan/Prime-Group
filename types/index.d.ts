/* eslint-disable no-unused-vars */

import { promises } from "dns";

// ====== USER PARAMS
declare type CreateUserParams = {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
};

// ====== CONSTANTUS PARAMS
declare type CreateContactParams = {
  date: Date | undefined;
  email: String;
  firstName: String;
  lastName: String;
  message: String;
};

// ====== SUBSCRIBE PARAMS
declare type SubscribeParams = {
  email: string;
};

// ====== PAYMENTS PARAMS
declare type PaymentParams = {
  amount: number | String;
  orderCreationId: String;
  razorpayPaymentId: String;
  razorpayOrderId: String;
  razorpaySignature: String;
  userId: string;
};

// ====== ORDER PARAMS
declare type CreateBooking = {
  author: any;
  bookingDate: Date | undefined;
  firstName: String;
  lastName: String;
  MobileNo: String | Number;
  Email: String;
  originalPrice: String | Number;
  offeredPrice: String | Number;
  country: String;
  location: {
    type: string;
    coordinates: [number, number];
  };
  landmark: String;
  zipcode: String;
  bookingType: String;
  bookingSubType: String;
  paymentDetails: String;
  bookingStatus: String;
  paymentStatus: String;
};

declare type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
};

// ====== URL QUERY PARAMS
declare type FormUrlQueryParams = {
  searchParams: string;
  key: string;
  value: string | number | null;
};

declare type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

declare type RemoveUrlQueryParams = {
  searchParams: string;
  keysToRemove: string[];
};

declare type CheckoutProps = {
  user: any;
};
