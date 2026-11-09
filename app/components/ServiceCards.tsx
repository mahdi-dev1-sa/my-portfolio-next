"use client";
import { useEffect, useRef } from "react";

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

// Each card lives at its own depth, so they move at different speeds and angles (parallax in 3D).
//   s: scroll speed   z: depth (px)   rx/ry/rz: resting rotation (deg)
const MOTION = [
  { s: 1.0, z: 40, rx: 8, ry: -14, rz: -2 },
  { s: 0.6, z: -20, rx: -6, ry: 10, rz: 1.5 },
  { s: 1.3, z: 70, rx: 6, ry: 12, rz: 2 },
  { s: 0.8, z: 0, rx: -8, ry: -10, rz: -1.5 },
  { s: 0.7, z: 20, rx: 6, ry: 14, rz: 1 },
  { s: 1.2, z: -30, rx: -6, ry: -12, rz: 2 },
  { s: 0.9, z: 50, rx: 4, ry: 6, rz: -1 },
];

function GlassCard({ index, id, title, text }: { index: number; id: string; title: string; text: string }) {
  const card = useRef<HTMLElement>(null);

  // hover: tilt toward the pointer and move the light spot (only CSS variables change)
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
    // OUTER box: flies through 3D space (transform set by the scroll loop) and flies in when first seen.
    // INNER card: tilts on hover. Each layer owns a different CSS property, so they never fight.
    <div
      data-fly
      className={`opacity-0 [scale:0.8] [translate:0_90px] transition-[opacity,translate,scale] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)] data-[in=1]:opacity-100 data-[in=1]:[scale:1] data-[in=1]:[translate:0_0] motion-reduce:transition-none ${
        index === SERVICES.length - 1 ? "sm:col-span-2" : ""
      }`}
      style={{ transitionDelay: `${(index % 4) * 90}ms`, willChange: "transform" }}
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
  const section = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const box = grid.current;
    if (!sec || !box) return;
    const cards = Array.from(box.querySelectorAll<HTMLElement>("[data-fly]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // cards fly in (from far away, small and faded) when they first appear on screen
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "1";
            seen.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => seen.observe(c));
    if (reduce) {
      cards.forEach((c) => (c.dataset.in = "1"));
      return () => seen.disconnect();
    }

    // pointer position (-1..1), smoothed so the cards glide instead of jumping
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // run the loop only while the section is on screen
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000;
      mouse.sx += (mouse.x - mouse.sx) * 0.06;
      mouse.sy += (mouse.y - mouse.sy) * 0.06;

      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      // p: -1 when the section is below the screen, 0 when centered, +1 when above
      const p = Math.max(-1.2, Math.min(1.2, (r.top + r.height / 2 - vh / 2) / vh));
      const small = window.innerWidth < 768;
      const k = small ? 0.5 : 1; // calmer on phones

      cards.forEach((el, i) => {
        const m = MOTION[i];
        const y = p * m.s * 70 * k + Math.sin(t * 0.9 + i * 1.3) * 9 * k;
        const x = mouse.sx * m.z * 0.35 * k + Math.cos(t * 0.6 + i) * 5 * k;
        const z = m.z * k - Math.abs(p) * 80 * k;
        const rx = (m.rx + p * 16 - mouse.sy * 5) * k;
        const ry = (m.ry - p * 20 + mouse.sx * 7) * k;
        const rz = (m.rz + Math.sin(t * 0.5 + i) * 1.4) * k;
        el.style.transform = `perspective(1100px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
      });
    };
    const watch = new IntersectionObserver(
      ([entry]) => {
        const now = entry.isIntersecting;
        if (now && !visible) raf = requestAnimationFrame(frame);
        if (!now) cancelAnimationFrame(raf);
        visible = now;
      },
      { rootMargin: "200px" }
    );
    watch.observe(sec);

    return () => {
      cancelAnimationFrame(raf);
      watch.disconnect();
      seen.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section ref={section} aria-labelledby="specializations" className="mt-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-fg">What I do</p>
      <h2 id="specializations" className="mt-3 text-3xl font-bold md:text-4xl">
        My specializations
      </h2>
      <div ref={grid} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <GlassCard key={s.id} index={i} {...s} />
        ))}
      </div>
    </section>
  );
}
