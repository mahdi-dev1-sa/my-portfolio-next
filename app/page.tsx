"use client";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";
import ServiceCards from "./components/ServiceCards";
import SteamTrain from "./components/SteamTrain";

// three.js is big, so load it in the browser only (never on the server)
const ParticleField = dynamic(() => import("./components/ParticleField"), { ssr: false });

export default function Home() {
  return (
    <main id="home" className="relative min-h-screen overflow-x-clip pb-20">
      <ParticleField />

      <div className="relative z-10">
        {/* first thing visitors see: name + 3D glass cards with my specializations */}
        <Hero />

        <div className="mx-auto max-w-5xl px-6">
          {/* short bio */}
          <p className="max-w-2xl pt-4 text-base leading-relaxed text-muted md:text-lg">
            I&apos;m a UI/UX designer and developer who builds apps, games and web experiences people
            enjoy using. I work across web, iOS, video editing, graphic design and AI, so an idea can go
            from a sketch to something you can tap, play or watch. I care about clean interfaces, smooth
            motion and details that feel considered.
          </p>

          {/* skills steam train: full-bleed, right under the bio */}
          <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2">
            <SteamTrain />
          </div>

          {/* glass cards: my specializations (nav links jump here) */}
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
      </div>
    </main>
  );
}
