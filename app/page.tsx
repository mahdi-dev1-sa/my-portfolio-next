"use client";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";
import ServiceCards from "./components/ServiceCards";
import Story from "./components/Story";

// three.js is big, so load it in the browser only (never on the server)
const ParticleField = dynamic(() => import("./components/ParticleField"), { ssr: false });

export default function Home() {
  return (
    <main id="home" className="relative min-h-screen overflow-x-clip pb-20">
      <ParticleField />

      <div className="relative z-10">
        {/* first screen: name + 3D carousel of glass cards with my specializations */}
        <Hero />

        <Story />

        <div className="mx-auto max-w-5xl px-6">
          {/* glass cards: my specializations */}
          <ServiceCards />

          {/* project cards */}
          <section id="projects" className="mt-24 grid scroll-mt-24 gap-6 md:grid-cols-3">
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
