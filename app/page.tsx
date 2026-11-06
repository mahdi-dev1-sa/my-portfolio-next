"use client";
import { useEffect, useState } from "react";

const words = ["UI/UX Designer", "Web Developer", "App Developer", "Game Developer"];

export default function Home() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="ambient-purple min-h-screen px-6 py-20">
      <div className="mx-auto max-w-5xl">
        {/* حالة التوفر: مؤشر بلون تمييزي */}
        <p className="mb-6 inline-flex items-center gap-2 text-sm text-muted">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          Available for work
        </p>

        {/* الهيدر: النص المتحرك */}
        <h1 className="text-5xl font-bold md:text-7xl">
          Hi, I&apos;m Mahdi.
          <br />
          <span className="text-muted">I am a </span>
          <span key={i} className="text-gradient-accent">{words[i]}</span>
        </h1>

        {/* أزرار القرار */}
        <div className="mt-10 flex gap-4">
          <button className="glow-accent rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink transition hover:brightness-110">
            Start a project
          </button>
          <button className="rounded-full border border-primary/50 px-6 py-3 text-foreground transition hover:border-accent hover:text-accent">
            See my work
          </button>
        </div>

        {/* الكروت */}
        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {["Expense Tracker", "Brick Breaker", "Dice"].map((name) => (
            <article
              key={name}
              className="group rounded-2xl border border-primary/30 bg-surface p-6 transition hover:border-primary hover:shadow-[0_0_40px_-10px_var(--primary)]"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                iOS App
              </span>
              <h3 className="mt-3 text-xl font-semibold">{name}</h3>
              <p className="mt-2 text-sm text-muted">Short project description here.</p>
              <span className="mt-6 inline-block text-sm text-accent transition group-hover:translate-x-1">
                View project →
              </span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
