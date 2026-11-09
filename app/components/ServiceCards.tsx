"use client";
import { useRef } from "react";

// The ids match the nav links (#web-development ...), so clicking a nav link scrolls to its card.
const SERVICES = [
  { id: "web-development", title: "Web Development", text: "Fast, modern websites built with Next.js." },
  { id: "app-development", title: "App Development", text: "Mobile apps that feel smooth and simple." },
  { id: "video-editing", title: "Video Editing", text: "Reels and short videos with motion and sound." },
  { id: "game-development", title: "Game Development", text: "Small games, from first prototype to play." },
  { id: "artificial-intelligence", title: "Artificial Intelligence (AI)", text: "AI tools and automations that save time." },
  { id: "ui-ux-design", title: "UI/UX Design", text: "Clean interfaces people enjoy using." },
  { id: "graphic-design", title: "Graphic Design", text: "Logos, posters and social media visuals." },
];

function GlassCard({ index, id, title, text }: { index: number; id: string; title: string; text: string }) {
  const card = useRef<HTMLElement>(null);

  // tilt toward the pointer and move the light spot (no React state: only CSS variables change)
  const onMove = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    const el = card.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    // outer box floats up and down, inner card tilts: two transforms on two elements
    <div
      className={`motion-safe:animate-float ${index === SERVICES.length - 1 ? "sm:col-span-2" : ""}`}
      style={{ animationDelay: `${index * -0.9}s` }}
    >
      <article
        ref={card}
        id={id}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative h-full scroll-mt-10 overflow-hidden rounded-3xl border border-foreground/15 bg-foreground/[0.06] p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[transform,border-color] duration-200 ease-out hover:border-accent/60"
        style={{
          transform: "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          ["--mx" as string]: "50%",
          ["--my" as string]: "0%",
        }}
      >
        {/* soft light that follows the pointer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(240px circle at var(--mx) var(--my), color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
          }}
        />
        {/* glass edge highlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
        />

        <span className="relative text-xs font-semibold tabular-nums tracking-widest text-accent-fg">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="relative mt-4 text-xl font-semibold leading-snug">{title}</h3>
        <p className="relative mt-2 text-sm text-muted">{text}</p>
      </article>
    </div>
  );
}

export default function ServiceCards() {
  return (
    <section aria-labelledby="specializations" className="mt-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-fg">What I do</p>
      <h2 id="specializations" className="mt-3 text-3xl font-bold md:text-4xl">
        My specializations
      </h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <GlassCard key={s.id} index={i} {...s} />
        ))}
      </div>
    </section>
  );
}
