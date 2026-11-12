"use client";
import { useEffect, useState } from "react";
import { SERVICES } from "../services";

// One capsule per specialization (the same names as the doors and the menu).
// The colors are a gradient: black -> deep purple -> purple -> the site's random accent color.
const SHADES = [
  { bg: "#17171d", fg: "#c9c9d3" },
  { bg: "#241d55", fg: "#d8d2ff" },
  { bg: "#34288a", fg: "#e6e1ff" },
  { bg: "var(--primary)", fg: "#0a0a0c" },
  { bg: "color-mix(in srgb, var(--primary) 60%, var(--accent))", fg: "#0a0a0c" },
  { bg: "color-mix(in srgb, var(--primary) 25%, var(--accent))", fg: "#0a0a0c" },
  { bg: "var(--accent)", fg: "#0a0a0c" },
];
const CAPSULES = SERVICES.map((s, i) => ({ label: s.title, ...SHADES[i % SHADES.length] }));

const DURATION = 2600; // counter length in ms
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type Phase = "loading" | "exit" | "done";

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 1 : DURATION;
    const start = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCount(Math.round(easeInOut(t) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timers.push(setTimeout(() => setPhase("exit"), 350));
        timers.push(setTimeout(() => setPhase("done"), 350 + 1600));
      }
    };
    raf = requestAnimationFrame(tick);

    // lock page scroll while the preloader is visible
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase === "done") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "done") return null;
  const exiting = phase === "exit";

  return (
    <div
      aria-hidden="true"
      className={`preloader ambient-purple bg-background fixed inset-0 z-50 flex flex-col justify-between px-6 py-8 transition-transform duration-[800ms] ease-[cubic-bezier(.76,0,.24,1)] ${
        exiting ? "-translate-y-full delay-[650ms]" : ""
      }`}
    >
      <p className="text-sm text-muted">
        <span className="font-semibold text-foreground">Mahdi Dev</span> · Portfolio
      </p>

      {/* capsule stack */}
      <div className="mx-auto w-full max-w-sm">
        {CAPSULES.map((c, i) => {
          const visible = count >= 8 + i * 13;
          const fromLeft = i % 2 === 0;
          let transform = visible ? "translateY(0)" : "translateY(60px)";
          if (exiting) {
            transform = `translateX(${fromLeft ? "-130vw" : "130vw"}) rotate(${fromLeft ? -8 : 8}deg)`;
          }
          return (
            <div
              key={c.label}
              className="relative -mt-5 flex h-[4.5rem] items-start rounded-full px-8 pt-3.5 text-sm font-medium first:mt-0"
              style={{
                background: c.bg,
                color: c.fg,
                zIndex: i,
                boxShadow: "0 8px 30px rgba(0,0,0,.5)",
                opacity: visible || exiting ? 1 : 0,
                transform,
                transition:
                  "transform 700ms cubic-bezier(.2,.8,.2,1), opacity 400ms ease",
                transitionDelay: exiting ? `${i * 60}ms` : "0ms",
              }}
            >
              {c.label}
            </div>
          );
        })}
      </div>

      {/* counter */}
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          Opening up the work
        </p>
        <div className="mt-2 flex items-end justify-between gap-6">
          <span className="text-7xl font-bold tabular-nums leading-none">
            {String(count).padStart(3, "0")}
          </span>
          <span className="mb-2 h-px w-32 bg-foreground/15">
            <span
              className="block h-px bg-accent"
              style={{ width: `${count}%` }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
