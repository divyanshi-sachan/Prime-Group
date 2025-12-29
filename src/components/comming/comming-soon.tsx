'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "lucide-react"
import { useState } from "react"
// Database actions removed - landing page only
// import { createSubscribe } from "@/lib/actions/subscribe.action";
import { useRouter } from "next/navigation"
import { AnimatedSubscribeButton } from "../ui/animated-subscribe-button";
import { CheckIcon, ChevronRightIcon } from "lucide-react";


export default function CommingSoon() {
  const route = useRouter()
  function handleChange(){
    route.push('/')
  }

  const [email, setEmail] = useState<string>('');

  async function createSubscribes(){
    // Database functionality removed - landing page only
    // Subscription will be implemented when database is set up
    alert("Thank you for subscribing! We'll notify you when we launch.");
    console.log("Subscription:", email);
    route.push('/');
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-pink-50 via-yellow-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
        <header className="text-center mb-auto">
          <h1 className="text-xl font-medium tracking-tight">MEMOWRIES</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto gap-8">
          <div className="space-y-6">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight">
              Great things take time, coming soon.
            </h2>
            <p className="text-lg text-gray-600">
              We are a small and growing startup with big ideas.
            </p>
            <Button
              variant="outline"
              className="rounded-none border-black hover:bg-black hover:text-white transition-colors"
              onClick={handleChange}
            >
              LEARN MORE →
            </Button>
          </div>
        </main>

        <footer className="mt-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 max-w-xl mx-auto">
            <h3 className="text-xl">Subscribe</h3>
            <div className="flex w-full gap-4">
              <Input
                type="email"
                placeholder="Email"
                className="rounded-none border-black focus-visible:ring-0 focus-visible:ring-offset-0"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <AnimatedSubscribeButton
                buttonColor="#000000"
                buttonTextColor="#ffffff"
                subscribeStatus={false}
                initialText={
                  <span className="group inline-flex items-center text-xs" onClick={createSubscribes}>
                    Subscribe{" "}
                    <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                }
                changeText={
                  <span className="group inline-flex items-center text-xs">
                    <CheckIcon className="mr-2 size-4" />
                    Subscribed{" "}
                  </span>
                }
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

