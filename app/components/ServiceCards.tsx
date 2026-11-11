"use client";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "../services";

// "Magic happens behind the doors": a hallway with one arched door per specialization, in two rows.
// Put the mouse on a door: it opens a little, inward, the other doors blur, and what I do shows right beside it.
// Click a door to go out to my projects. (On a phone: tap once to look, tap again to go.)
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
          className="absolute left-1/2 top-[21%] w-[86%] -translate-x-1/2 rounded-[3px] border border-[#8a6a2b] px-1 py-1 text-center font-mono text-[clamp(7px,1.9vw,13px)] font-bold uppercase leading-tight tracking-[0.06em] text-[#2b1d08] shadow-[0_2px_4px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.7)]"
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

type Service = (typeof SERVICES)[number];

function goToProjects() {
  document.getElementById("projects")?.scrollIntoView({ block: "start" });
}

// what I do with one specialization: big, high-contrast, easy to read
function Info({ s }: { s: Service }) {
  return (
    <div>
      <h3 className="text-2xl font-bold leading-tight tracking-tight sm:text-[1.75rem]">{s.title.replace(" (AI)", "")}</h3>
      <p className="mt-2 text-sm font-semibold leading-snug text-accent-fg sm:text-base">{s.tagline}</p>
      <ul className="mt-4 grid gap-3">
        {s.points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-base font-medium leading-snug text-foreground sm:text-[1.05rem]">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-ink"
            >
              ✓
            </span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

// two rows: 4 doors, then 3
const ROWS = [SERVICES.slice(0, 4), SERVICES.slice(4)];

export default function ServiceCards() {
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : SERVICES[active];

  const enter = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    setActive(i);
  };
  // a short pause, so the words do not blink when the mouse crosses the gap between two doors
  const leave = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), 140);
  };

  // doors rise in the first time they appear on screen
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
  }, []);

  // nav links (#web-development ...) open that door
  useEffect(() => {
    const go = () => {
      const i = SERVICES.findIndex((s) => s.id === window.location.hash.slice(1));
      if (i >= 0) setActive(i);
    };
    window.addEventListener("hashchange", go);
    return () => {
      window.removeEventListener("hashchange", go);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // on a phone, tapping anywhere else closes the open door
  useEffect(() => {
    if (active === null) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [active]);

  return (
    <section aria-labelledby="specializations" className="mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent-fg">My specializations</p>
      <h2
        id="specializations"
        className="mx-auto mt-3 max-w-3xl text-center text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[1.05] tracking-tight"
      >
        Magic happens behind the doors
      </h2>

      {/* the hallway: two rows of doors. The doors never move, only the words appear */}
      <div ref={box} className="relative mt-12 grid gap-y-14">
        {SERVICES.map((s) => (
          <span key={s.id} id={s.id} aria-hidden="true" className="absolute left-0 top-0 scroll-mt-24" />
        ))}

        {ROWS.map((row, r) => {
          const base = r * 4;
          return (
            <div key={r} className="flex items-end justify-center gap-3 border-b border-foreground/20 px-2 sm:gap-8">
              {row.map((s, j) => {
                const i = base + j;
                const wordsOnRight = j < Math.ceil(row.length / 2);
                return (
                  <div
                    key={s.id}
                    data-door
                    style={{ transitionDelay: `${i * 90}ms` }}
                    className={`relative w-[calc(25%-0.75rem)] max-w-[11rem] translate-y-10 opacity-0 transition-[opacity,translate] duration-[800ms] ease-[cubic-bezier(.2,.8,.2,1)] data-[in=1]:translate-y-0 data-[in=1]:opacity-100 motion-reduce:transition-none ${
                      active === i ? "z-30" : "z-0"
                    }`}
                  >
                    {/* when one door is picked, the others blur and fade back */}
                    <div
                      className={`transition-[filter,opacity,scale] duration-300 motion-reduce:transition-none ${
                        active !== null && active !== i ? "scale-[0.97] opacity-45 blur-[3px]" : ""
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`${s.title}: ${s.text}. Click to see my projects.`}
                        onClick={() => (active === i ? goToProjects() : enter(i))}
                        onPointerEnter={(e) => e.pointerType === "mouse" && enter(i)}
                        onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
                        onFocus={() => enter(i)}
                        onBlur={leave}
                        className="block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        <DoorArt index={i} title={s.title} open={active === i} />
                      </button>
                    </div>

                    {/* the words, right beside the door */}
                    {active === i && (
                      <div
                        className={`pointer-events-none absolute top-0 hidden w-80 rounded-2xl border border-foreground/20 bg-background/95 p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md transition-[opacity,translate] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] starting:opacity-0 motion-reduce:transition-none sm:block ${
                          wordsOnRight
                            ? "left-[calc(100%+0.75rem)] starting:-translate-x-3"
                            : "right-[calc(100%+0.75rem)] starting:translate-x-3"
                        }`}
                      >
                        <Info s={s} />
                        <p className="mt-5 text-sm font-semibold text-accent-fg">Click to see my projects →</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* on a phone there is no room beside the door, so the words show under the hallway */}
      <div className="mt-6 min-h-[17rem] sm:hidden" aria-live="polite">
        {current ? (
          <div>
            <Info s={current} />
            <button
              type="button"
              onClick={goToProjects}
              className="mt-4 rounded-full border border-foreground/15 px-4 py-1.5 text-sm font-semibold text-accent-fg"
            >
              See my projects →
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-muted">Tap a door to see what is behind it.</p>
        )}
      </div>
      <p className="mt-6 hidden text-center text-sm text-muted sm:block">
        Put the mouse on a door to see what is behind it. Click it to see my projects.
      </p>
    </section>
  );
}
