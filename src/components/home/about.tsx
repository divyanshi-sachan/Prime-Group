'use client'

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import AnimatedTitle from "./AnimatedTitle";
import Image from "next/image";
import { VelocityScroll } from "../ui/scroll-based-velocity"

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase md:text-[10px]">
          Welcome to Prime Group
        </p>

        {/* MEMOW is about to change the way you experience photography. */}
        <AnimatedTitle
          title="Prime <b>G</b>roup connects you<br />with your <b>p</b>erfect match"
          containerClass="mt-5 !text-black text-center"
        />

        <div className="about-subtext">
          <p className="text-gray-500">
          We're building a trusted platform that helps you find your life partner, 
          connecting verified profiles and meaningful relationships.
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <Image
            src="https://photographymatterspodcast.com/wp-content/uploads/2019/02/memories-matter.jpg"
            alt="Background"
            width={900}
            height={900}
            className="absolute left-0 top-0 size-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white rounded-xl">
            <VelocityScroll className="font-mono text-white bottom-0">FIND YOUR PERFECT MATCH</VelocityScroll>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
