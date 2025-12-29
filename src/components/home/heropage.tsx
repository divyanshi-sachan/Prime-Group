import Image from "next/image"
import { Button } from "@/components/ui/button"
import { VelocityScroll } from "../ui/scroll-based-velocity"
import Link from "next/link"

export default function HeroPage() {
  return (
    <div className="max-h-2/3 bg-white">
      <main className="container relative mx-auto grid max-h-2/3 md:grid-cols-2 items-center gap-8 px-4 py-20">
        <div className="relative aspect-[3/3] w-full max-w-2xl">
          <Image
            src="https://img.freepik.com/premium-photo/man-holding-camera-white-background_1194579-83.jpg"
            alt="Phone advertisement showing a person holding the device"
            fill
            className="object-cover object-top rounded-xl"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white rounded-xl">
            {/* <p className="font-mono text-sm md:text-5xl">Experience the future of mobile photography</p> */}
            <VelocityScroll className="font-mono text-white bottom-0">MAKE YOUR MEMOWRIES</VelocityScroll>
          </div>
        </div>
        <div className="flex flex-col gap-6 md:gap-8 max-w-xl">
          <div className="space-y-2">
            <p className="text-sm tracking-wide">Introducing. Phone (1).</p>
            <h1 className="text-4xl md:text-6xl tracking-tight">Pure Instinct.</h1>
          </div>
          <p className="text-sm leading-relaxed">
            Designed with instinct, to bring joy back to the everyday. Through the Glyph Interface, a
            perfected OS and exceptional dual camera. All startlingly fast.
          </p>
          <div className="flex gap-4">
            {/* <Button
              variant="outline"
              className="rounded-full text-sm px-6"
            >
              Book now
            </Button> */}
            <Link href="/contact-us">
            <Button
              variant="outline"
              className="rounded-full text-sm px-6"
            >
              Contact Us
            </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

