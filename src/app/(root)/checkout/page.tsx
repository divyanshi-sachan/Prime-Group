import CheckoutPage from "@/components/checkout/Checkout";
import Script from 'next/script';
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserById(userId);
  return (
    <>
    <Script
    id="razorpay-checkout-js"
    src="https://checkout.razorpay.com/v1/checkout.js"
   />
    <CheckoutPage user={user}/>
    </>
  );
}
