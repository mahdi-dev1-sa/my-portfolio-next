"use client";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "../services";

// "Magic happens behind the doors": a hallway with one arched door per specialization.
// Hover a door to peek inside (it opens a little, inward). Click it to enter:
// the door stands on the left and what I do shows right beside it.
const COLORS = ["#1f4fd8", "#6d4bd6", "#8fa9c4", "#d0605a", "#1f9d8f", "#d99a2b", "#c2559a"];

// The picture of one door. It fills the width of whatever holds it.
function DoorArt({ index, title, open }: { index: number; title: string; open: boolean }) {
  const color = COLORS[index % COLORS.length];
  return (
    <span aria-hidden="true" className="relative block aspect-[1/2.05] w-full [perspective:1100px]">
      {/* door frame (the arch) */}
      <span className="absolute inset-0 rounded-t-[999px] border border-foreground/15 bg-foreground/[0.07] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]" />

      {/* behind the door: a warm light */}
      <span
        className="absolute inset-[5%] flex items-end justify-center overflow-hidden rounded-t-[999px] pb-[10%]"
        style={{ background: "radial-gradient(120% 90% at 50% 100%, #fff1bd 0%, #e8b45a 45%, #6b3d12 100%)" }}
      >
        <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#4a2a08]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </span>

      {/* the door itself: opens a little, inward, around its left edge */}
      <span
        className="absolute inset-[5%] origin-left overflow-hidden rounded-t-[999px] shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] transition-transform duration-[750ms] ease-[cubic-bezier(.3,.8,.2,1)] [transform-style:preserve-3d]"
        style={{
          background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 70%, #000))`,
          transform: open ? "rotateY(28deg)" : "rotateY(0deg)",
        }}
      >
        {/* wood grain */}
        <span
          className="absolute inset-0"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 7px)" }}
        />
        {/* raised panel */}
        <span className="absolute inset-x-[14%] top-[40%] bottom-[8%] rounded-[3px] border border-black/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.08)]" />

        {/* brass name plate */}
        <span
          className="absolute left-1/2 top-[21%] w-[86%] -translate-x-1/2 rounded-[3px] border border-[#8a6a2b] px-1 py-1 text-center font-mono text-[clamp(8px,0.9vw,13px)] font-bold uppercase leading-tight tracking-[0.06em] text-[#2b1d08] shadow-[0_2px_4px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.7)]"
          style={{
            background: "linear-gradient(180deg, #f7ebc4, #e2c986 55%, #c9a95f)",
            textShadow: "0 1px 0 rgba(255,255,255,0.65)",
          }}
        >
          {title.replace(" (AI)", "")}
        </span>

        {/* door handle: a brass back plate, a round rose, a lever and a keyhole */}
        <span className="absolute right-[6%] top-[52%] aspect-[26/38] w-[27%]">
          <span
            className="absolute inset-y-0 right-0 w-[40%] rounded-full"
            style={{ background: "linear-gradient(135deg, #f6e7b4, #b9974a 55%, #7d6128)", boxShadow: "0 3px 6px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.7)" }}
          />
          <span
            className="absolute right-[5%] top-[14%] aspect-square w-[30%] rounded-full"
            style={{ background: "radial-gradient(circle at 35% 30%, #fff3cc, #c4a24f 55%, #6d5420)", boxShadow: "0 2px 4px rgba(0,0,0,0.6)" }}
          />
          <span
            className="absolute right-[12%] top-[17%] aspect-[8/1] w-[92%] rounded-full"
            style={{ background: "linear-gradient(180deg, #fff3c8, #c4a24f 45%, #6d5420)", boxShadow: "0 3px 5px rgba(0,0,0,0.55)" }}
          />
          <span className="absolute bottom-[14%] right-[13%] aspect-square w-[14%] rounded-full bg-[#1d1608]" />
          <span className="absolute bottom-[3%] right-[18.5%] h-[10%] w-[3%] rounded-full bg-[#1d1608]" />
        </span>
      </span>
    </span>
  );
}

const ctrl =
  "rounded-full border border-foreground/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted transition hover:border-accent hover:text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function ServiceCards() {
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<number | null>(null); // the door we walked into
  const [hover, setHover] = useState<number | null>(null); // the door we are peeking into
  const n = SERVICES.length;
  const current = view === null ? null : SERVICES[view];

  // doors rise in the first time they appear on screen (and again when we walk back out)
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const doors = Array.from(el.querySelectorAll<HTMLElement>("[data-door]"));
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
    doors.forEach((d) => seen.observe(d));
    return () => seen.disconnect();
  }, [view]);

  // nav links (#web-development ...) walk into that door
  useEffect(() => {
    const go = () => {
      const i = SERVICES.findIndex((s) => s.id === window.location.hash.slice(1));
      if (i >= 0) setView(i);
    };
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);

  return (
    <section aria-labelledby="specializations" className="mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent-fg">My specializations</p>
      <h2
        id="specializations"
        className="mx-auto mt-3 max-w-3xl text-center text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[1.05] tracking-tight"
      >
        Magic happens behind the doors
      </h2>

      {/* the hallway: a fixed-height stage, so nothing jumps when we walk in or out */}
      <div className="relative mt-12 flex min-h-[32rem] items-end border-b border-foreground/20 pb-0">
        {SERVICES.map((s) => (
          <span key={s.id} id={s.id} aria-hidden="true" className="absolute left-0 top-0 scroll-mt-24" />
        ))}

        {current === null ? (
          <div
            ref={box}
            className="flex w-full snap-x gap-4 overflow-x-auto px-2 pb-0 pt-4 sm:justify-between sm:gap-4 sm:overflow-visible"
          >
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                data-door
                style={{ transitionDelay: `${i * 90}ms` }}
                className="w-28 shrink-0 translate-y-10 snap-center opacity-0 transition-[opacity,translate] duration-[800ms] ease-[cubic-bezier(.2,.8,.2,1)] data-[in=1]:translate-y-0 data-[in=1]:opacity-100 motion-reduce:transition-none sm:w-[calc((100%-6rem)/7)] sm:max-w-[9.5rem] sm:shrink"
              >
                <button
                  type="button"
                  aria-label={`${s.title}: ${s.text}. Click to enter.`}
                  onClick={() => setView(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <DoorArt index={i} title={s.title} open={hover === i} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            key={current.id}
            aria-live="polite"
            className="grid w-full items-end gap-8 transition-[opacity,translate] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] starting:translate-y-4 starting:opacity-0 motion-reduce:transition-none sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-16 lg:grid-cols-[14rem_minmax(0,30rem)] lg:justify-center"
          >
            <div className="mx-auto w-44 sm:w-full">
              <DoorArt index={view ?? 0} title={current.title} open />
            </div>
            <div className="pb-8 sm:self-center sm:pb-0">
              <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {current.title.replace(" (AI)", "")}
              </h3>
              <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-fg">{current.tagline}</p>
              <ul className="mt-5 grid gap-3">
                {current.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-base font-medium">
                    <span
                      aria-hidden="true"
                      className="grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-[11px] text-background"
                    >
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* controls (same height in both views) */}
      <div className="mt-6 flex h-10 items-center justify-center gap-3">
        {view === null ? (
          <p className="text-center text-sm text-muted">Hover a door to peek inside, click it to enter.</p>
        ) : (
          <>
            <button type="button" onClick={() => setView((view + n - 1) % n)} className={ctrl} aria-label="Previous door">
              ←
            </button>
            <button type="button" onClick={() => setView(null)} className={ctrl}>
              All doors
            </button>
            <button type="button" onClick={() => setView((view + 1) % n)} className={ctrl} aria-label="Next door">
              →
            </button>
          </>
        )}
      </div>
    </section>
  );
}
