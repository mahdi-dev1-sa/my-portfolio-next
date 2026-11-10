"use client";
import { useEffect, useRef, useState } from "react";

// "My story": a pinned timeline. Scrolling takes you back in time: the big year changes
// (its digits scramble first), and the entries on the right slide past a vertical line.
// NOTE: the years and texts below are placeholders. Replace them with your real story.
const STEPS = [
  {
    year: "2026",
    range: "2026 — NOW",
    title: "Independent freelancer",
    place: "Working remotely · Algeria",
    text: "Building websites and iOS apps for clients, from the first sketch to the final launch.",
  },
  {
    year: "2025",
    range: "2025 — 2026",
    title: "App & game developer",
    place: "Personal projects",
    text: "Shipped small iOS apps and games like Expense Tracker, Brick Breaker and Dice.",
  },
  {
    year: "2024",
    range: "2024 — 2025",
    title: "Video & graphic designer",
    place: "Content creation",
    text: "Edited reels and short videos with motion and sound, and designed logos and social media visuals.",
  },
  {
    year: "2023",
    range: "2023 — 2024",
    title: "Started with web & UI/UX",
    place: "Self-taught",
    text: "Learned to design clean interfaces and turn them into fast, modern websites.",
  },
];
const N = STEPS.length;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export default function Story() {
  const track = useRef<HTMLElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const fill = useRef<HTMLSpanElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [year, setYear] = useState(STEPS[0].year);

  // scroll: everything comes from one number (how far we are through the section)
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      const a = p * (N - 1);
      const step = window.innerWidth < 768 ? 150 : 168;
      items.current.forEach((it, i) => {
        if (!it) return;
        const d = i - a;
        const ad = Math.abs(d);
        it.style.transform = `translateY(calc(-50% + ${(d * step).toFixed(1)}px)) scale(${(1 - 0.06 * Math.min(ad, 1.5)).toFixed(3)})`;
        it.style.opacity = clamp(1 - ad * 0.75).toFixed(3);
        it.style.filter = reduce ? "none" : `blur(${(Math.min(ad, 1.5) * 2.5).toFixed(2)}px)`;
        it.style.pointerEvents = ad < 0.5 ? "auto" : "none";
      });
      if (fill.current) fill.current.style.height = `${(p * 100).toFixed(2)}%`;
      if (knob.current) knob.current.style.top = `${(p * 100).toFixed(2)}%`;
      if (bar.current) bar.current.style.width = `${(p * 100).toFixed(2)}%`;
      const now = Math.round(a);
      if (now !== activeRef.current) {
        activeRef.current = now;
        setActive(now);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // the year: digits scramble, then settle one by one
  useEffect(() => {
    const target = STEPS[active].year;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setYear(target);
      return;
    }
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const el = performance.now() - t0;
      setYear(
        target
          .split("")
          .map((ch, k) => (el > 160 + k * 110 ? ch : String(Math.floor(Math.random() * 10))))
          .join("")
      );
      if (el > 160 + target.length * 110) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <section
      ref={track}
      id="my-story"
      aria-labelledby="my-story-title"
      className="relative"
      style={{ height: `${100 + N * 55}svh` }}
    >
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 md:grid-cols-[1fr_1.1fr] md:gap-16">
          {/* left: title, big year, progress */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-fg">My story</p>
            <h2 id="my-story-title" className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">
              Let&apos;s go back in time.
            </h2>
            <p
              aria-label={STEPS[active].year}
              className="mt-2 text-[clamp(4.5rem,15vw,10rem)] font-semibold leading-none tracking-tight tabular-nums md:mt-4"
            >
              {year}
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">{STEPS[active].range}</p>
            <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted">
              <span>{String(active + 1).padStart(2, "0")}</span>
              <span className="relative h-px w-40 bg-foreground/15">
                <span ref={bar} className="absolute inset-y-0 left-0 bg-accent" />
              </span>
              <span>{String(N).padStart(2, "0")}</span>
            </div>
          </div>

          {/* right: vertical line with a moving dot, entries slide past it */}
          <div className="relative h-[19rem] md:h-[28rem]">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-foreground/15">
              <span ref={fill} className="absolute inset-x-0 top-0 bg-accent" />
              <span
                ref={knob}
                className="glow-accent absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
              />
            </span>
            {STEPS.map((s, i) => (
              <article
                key={s.year}
                ref={(n) => {
                  items.current[i] = n;
                }}
                className="absolute inset-x-0 top-1/2 pl-8 will-change-transform md:pl-12"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-fg">{s.range}</p>
                <h3 className="mt-2 text-xl font-semibold md:text-2xl">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.place}</p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/80 md:text-base">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
