"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";
import ServiceCards from "./components/ServiceCards";
import Story from "./components/Story";
import Contact from "./components/Contact";
import SocialCards from "./components/SocialCards";
import DoorRush from "./components/DoorRush";

// three.js is big, so load it in the browser only (never on the server)
const ParticleField = dynamic(() => import("./components/ParticleField"), { ssr: false });

// the tools I work with (edit this list to match what you really use)
const TOOLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Three.js",
  "Swift",
  "SwiftUI",
  "Xcode",
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Unity",
  "Python",
  "Figma",
  "Photoshop",
  "Illustrator",
];

// A thin band under the hero: my tools drift past, forever. It pauses when the mouse is on it.
function Tools() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // the strip holds the list twice, so sliding it left by half loops without a jump
    const a = el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], {
      duration: 45000,
      iterations: Infinity,
      easing: "linear",
    });
    const stop = () => a.pause();
    const go = () => a.play();
    el.addEventListener("pointerenter", stop);
    el.addEventListener("pointerleave", go);
    return () => {
      el.removeEventListener("pointerenter", stop);
      el.removeEventListener("pointerleave", go);
      a.cancel();
    };
  }, []);

  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className={`flex shrink-0 items-center ${hidden ? "motion-reduce:hidden" : "motion-reduce:flex-wrap motion-reduce:justify-center"}`}>
      {TOOLS.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap">
          <span className="px-5 text-lg font-semibold text-foreground/80 transition-colors hover:text-accent-fg sm:px-7 sm:text-2xl">{t}</span>
          <span aria-hidden="true" className="text-sm text-accent-fg">
            &#10022;
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Tools I work with" className="relative z-10 mt-16 sm:mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">Tools I work with</p>
      <div className="mt-5 overflow-hidden border-y border-foreground/10 py-5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div ref={track} className="flex w-max motion-reduce:w-full">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main id="home" className="relative min-h-screen overflow-clip pb-20">
      <ParticleField />
      {/* a click on a specialization in the nav: rush down to the doors, open the door, walk in */}
      <DoorRush />

      <div className="relative z-10">
        {/* first screen: name + 3D carousel of glass cards with my specializations */}
        <Hero />

        {/* a thin band of my tools, between the glass cards and the doors */}
        <Tools />

        <div className="mx-auto max-w-5xl px-6">
          {/* glass cards: my specializations */}
          <ServiceCards />
        </div>

        {/* my story: after the doors, like in the menu */}
        <Story />

        {/* contact: form + WhatsApp + email */}
        <Contact />

        {/* the last thing on the page: two playing cards, TikTok and Instagram */}
        <SocialCards />
      </div>
    </main>
  );
}
