"use client";
import LocalTime from "./components/LocalTime";
import dynamic from "next/dynamic";
import { Kaushan_Script } from "next/font/google";
import Nav from "./components/Nav";
import ServiceCards from "./components/ServiceCards";
import SteamTrain from "./components/SteamTrain";

// brush-script font for the name
const brush = Kaushan_Script({ weight: "400", subsets: ["latin"], display: "swap" });

// three.js is big, so load it in the browser only (never on the server)
const ParticleField = dynamic(() => import("./components/ParticleField"), { ssr: false });

export default function Home() {
  return (
    <main id="home" className="ambient-purple relative min-h-screen overflow-x-clip px-6 pb-20 pt-7">
      <ParticleField />

      {/* local time: pinned near the right edge of the page, clear of the cord */}
      <div className="absolute right-[3.75rem] top-7 z-10 sm:right-24">
        <LocalTime />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* top bar: navigation (the local time chip sits at the far right) */}
        <div className="mb-8 flex min-h-[34px] items-center nav:mt-14 sm:mb-10">
          <Nav />
        </div>

        {/* availability badge */}
        <p className="mb-3 inline-flex items-center gap-2 whitespace-nowrap text-sm text-muted sm:mb-5">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          <span className="sm:hidden">Available</span>
          <span className="hidden sm:inline">Available for work</span>
        </p>

        {/* header */}
        <h1 className={`${brush.className} text-6xl font-normal leading-tight md:text-8xl`}>
          Hi, I&apos;m Mahdi.
        </h1>

        {/* short bio */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          I&apos;m a UI/UX designer and developer who builds apps, games and web experiences people
          enjoy using. I work across web, iOS, video editing, graphic design and AI, so an idea can go
          from a sketch to something you can tap, play or watch. I care about clean interfaces, smooth
          motion and details that feel considered.
        </p>

        {/* skills steam train: full-bleed, right under the bio */}
        <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2">
          <SteamTrain />
        </div>

        {/* call-to-action buttons */}
        <div className="mt-10 flex gap-4">
          <button className="glow-accent rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink transition hover:brightness-110">
            Start a project
          </button>
          <button className="rounded-full border border-primary/50 px-6 py-3 text-foreground transition hover:border-accent hover:text-accent-fg">
            See my work
          </button>
        </div>

        {/* glass cards: my specializations */}
        <ServiceCards />

        {/* project cards */}
        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {["Expense Tracker", "Brick Breaker", "Dice"].map((name) => (
            <article
              key={name}
              className="group rounded-2xl border border-primary/30 bg-surface p-6 transition hover:border-primary hover:shadow-[0_0_40px_-10px_var(--primary)]"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-fg">
                iOS App
              </span>
              <h3 className="mt-3 text-xl font-semibold">{name}</h3>
              <p className="mt-2 text-sm text-muted">Short project description here.</p>
              <span className="mt-6 inline-block text-sm text-accent-fg transition group-hover:translate-x-1">
                View project →
              </span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
