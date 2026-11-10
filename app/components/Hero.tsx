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

// The first thing a visitor sees: my name, then a ribbon of glass cards (my specializations) that spirals around them.
// The tall box lets the page scroll while the stage stays pinned; scrolling moves the carousel.
export default function Hero() {
  const track = useRef<HTMLDivElement>(null);

  return (
    <div ref={track} id="hero-track" data-intro="1" className="relative h-[700vh]">
      <div className="ambient-purple sticky top-0 h-svh overflow-hidden">
        {/* name: two lines that run across the screen in opposite directions as you scroll */}
        <h1 aria-label="Hi, I'm Mahdi." className={`${brush.className} absolute inset-0 z-10 font-normal`}>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(50%-1.05em)] block whitespace-nowrap text-center text-[clamp(3.5rem,11vw,9.5rem)] leading-none will-change-transform"
            style={{ transform: "translate3d(calc(var(--run, 0) * 1vw), 0, 0)" }}
          >
            Hi, I&apos;m
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(50%-0.05em)] block whitespace-nowrap text-center text-[clamp(3.5rem,11vw,9.5rem)] leading-none will-change-transform"
            style={{ transform: "translate3d(calc(var(--run, 0) * -1vw), 0, 0)" }}
          >
            Mahdi.
          </span>
        </h1>

        {/* availability badge */}
        <div
          style={{ opacity: "var(--intro, 1)" }}
          className="absolute inset-x-0 top-0 z-10 px-6 pt-24 nav:pt-40"
        >
          <div className="mx-auto max-w-5xl">
            <p className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-muted">
              <span className="size-2 animate-pulse rounded-full bg-accent" />
              <span className="sm:hidden">Available</span>
              <span className="hidden sm:inline">Available for work</span>
            </p>
          </div>
        </div>

        <GlassCarousel trackRef={track} />

        {/* buttons */}
        <div
          style={{ opacity: "var(--intro, 1)" }}
          className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-3 px-6 sm:gap-4 [[data-intro='0']_&]:pointer-events-none"
        >
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
