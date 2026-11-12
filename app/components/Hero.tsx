"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Kaushan_Script } from "next/font/google";
import LocalTime from "./LocalTime";
import Nav from "./Nav";

// three.js is big, so load it in the browser only (never on the server)
const GlassCarousel = dynamic(() => import("./GlassCarousel"), { ssr: false });

// brush-script font for the name
const brush = Kaushan_Script({ weight: "400", subsets: ["latin"], display: "swap" });

// my specializations, as job titles
const ROLES = ["Web Developer", "App Developer", "Video Editor", "Game Developer", "AI Specialist", "UI/UX Designer", "Graphic Designer"];

// "I am a ...": a spiral-bound notepad whose page flips up and over to show the next specialization
function RoleCard() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const t1 = setInterval(() => {
      if (reduce) {
        setI((v) => (v + 1) % ROLES.length);
        return;
      }
      setFlip(true);
      t2 = setTimeout(() => {
        setI((v) => (v + 1) % ROLES.length);
        setFlip(false);
      }, 650);
    }, 2800);
    return () => {
      clearInterval(t1);
      if (t2) clearTimeout(t2);
    };
  }, []);

  const next = ROLES[(i + 1) % ROLES.length];
  const face =
    "flex min-w-[16ch] items-center justify-center whitespace-nowrap rounded-xl bg-foreground px-5 py-2 text-center text-[clamp(1.15rem,3.2vw,2.1rem)] font-semibold leading-tight text-background";

  return (
    <div className="relative" style={{ perspective: "800px" }}>
      <span className="sr-only">I am a {ROLES.join(", ")}</span>
      {/* the metal rings */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 -top-2.5 z-10 flex justify-between">
        {Array.from({ length: 9 }).map((_, k) => (
          <span key={k} className="h-4 w-1.5 rounded-full border-2 border-foreground/70 bg-background" />
        ))}
      </div>
      <div aria-hidden="true" className="relative">
        {/* the page underneath: the next one */}
        <div className={face}>{next}</div>
        {/* the page on top: it flips up and over, hinged at its top edge */}
        <div
          className={`${face} absolute inset-0`}
          style={{
            transformOrigin: "top",
            backfaceVisibility: "hidden",
            transform: flip ? "rotateX(-100deg)" : "rotateX(0deg)",
            transition: flip ? "transform 650ms cubic-bezier(.5,0,.75,0)" : "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          {ROLES[i]}
        </div>
      </div>
    </div>
  );
}

// The first thing a visitor sees: my name, then a ribbon of glass cards (my specializations) that spirals around them.
// The tall box lets the page scroll while the stage stays pinned; scrolling moves the carousel.
export default function Hero() {
  const track = useRef<HTMLDivElement>(null);

  return (
    <div ref={track} id="hero-track" data-intro="1" className="relative h-[1150vh]">
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

        {/* "I am a [flipping page]": sits right under the name and fades out as you scroll */}
        <div
          style={{ opacity: "var(--intro, 1)", top: "calc(50% + clamp(3.5rem, 11vw, 9.5rem) * 0.95 + 1.1rem)" }}
          className="absolute inset-x-0 z-20 flex items-center justify-center gap-3 px-6"
        >
          <span className="text-base text-muted sm:text-lg">I am a</span>
          <RoleCard />
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
