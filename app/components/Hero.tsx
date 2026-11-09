"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { Kaushan_Script } from "next/font/google";
import LocalTime from "./LocalTime";
import Nav from "./Nav";

// three.js is big, so load it in the browser only (never on the server)
const GlassCarousel = dynamic(() => import("./GlassCarousel"), { ssr: false });

// brush-script font for the name
const brush = Kaushan_Script({ weight: "400", subsets: ["latin"], display: "swap" });

// The first thing a visitor sees: my name, and a 3D carousel of glass cards with my specializations.
// The tall box lets the page scroll while the stage stays pinned; scrolling moves the carousel.
export default function Hero() {
  const track = useRef<HTMLDivElement>(null);

  return (
    <div ref={track} id="hero-track" className="relative h-[480vh]">
      <div className="ambient-purple sticky top-0 h-svh overflow-hidden">
        {/* name */}
        <div className="absolute inset-x-0 top-0 z-10 px-6 pt-24 nav:pt-40">
          <div className="mx-auto max-w-5xl">
            <p className="mb-2 inline-flex items-center gap-2 whitespace-nowrap text-sm text-muted sm:mb-3">
              <span className="size-2 animate-pulse rounded-full bg-accent" />
              <span className="sm:hidden">Available</span>
              <span className="hidden sm:inline">Available for work</span>
            </p>
            <h1 className={`${brush.className} text-6xl font-normal leading-tight md:text-8xl`}>
              Hi, I&apos;m Mahdi.
            </h1>
          </div>
        </div>

        <GlassCarousel trackRef={track} />

        {/* buttons */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-3 px-6 sm:gap-4">
          <button className="glow-accent rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 sm:px-6 sm:py-3 sm:text-base">
            Start a project
          </button>
          <button className="rounded-full border border-primary/50 px-5 py-2.5 text-sm text-foreground transition hover:border-accent hover:text-accent-fg sm:px-6 sm:py-3 sm:text-base">
            See my work
          </button>
        </div>

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 z-30 px-6 pt-7">
          <div className="mx-auto max-w-5xl">
            <div className="flex min-h-[34px] items-center nav:mt-14">
              <Nav />
            </div>
          </div>
        </div>
        <div className="absolute right-[3.75rem] top-7 z-30 sm:right-24">
          <LocalTime />
        </div>
      </div>
    </div>
  );
}
