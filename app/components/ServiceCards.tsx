"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { SERVICES } from "../services";
import "../doors.css";

// "Magic happens behind the doors": a hallway with one arched door per specialization, in two rows.
// Put the mouse on a door: it opens a little, inward, the other doors blur, and what I do shows right beside it.
// Click a door to walk through it: the camera zooms into the door and opens that specialization's page.
// (On a phone: tap once to look, tap again to go in.)
const COLORS = ["#1f4fd8", "#6d4bd6", "#8fa9c4", "#d0605a", "#1f9d8f", "#d99a2b", "#c2559a"];

// The picture of one door. It fills the width of whatever holds it.
function DoorArt({ index, title, open, angle = 28, dive = false }: { index: number; title: string; open: boolean; angle?: number; dive?: boolean }) {
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
        {/* walking in: the room behind the door is dark */}
        <span
          className="absolute inset-0 bg-[#070912]"
          style={{ opacity: dive ? 1 : 0, transition: "opacity 600ms ease-in 100ms" }}
        />
      </span>

      {/* the door itself: opens a little, inward, around its left edge */}
      <span
        className="absolute inset-[5%] origin-left overflow-hidden rounded-t-[999px] shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] transition-transform duration-[750ms] ease-[cubic-bezier(.3,.8,.2,1)] [transform-style:preserve-3d]"
        style={{
          background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 70%, #000))`,
          transform: open ? `rotateY(${angle}deg)` : "rotateY(0deg)",
          transitionDelay: open ? "180ms" : "0ms",
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
            style={{
              background: "linear-gradient(180deg, #fff3c8, #c4a24f 45%, #6d5420)",
              boxShadow: "0 3px 5px rgba(0,0,0,0.55)",
              // the lever turns down first, then the door swings open
              transformOrigin: "92% 50%",
              transform: open ? "rotate(-26deg)" : "rotate(0deg)",
              transition: `transform 220ms ease-out ${open ? "0ms" : "500ms"}`,
            }}
          />
          <span className="absolute bottom-[14%] right-[13%] aspect-square w-[14%] rounded-full bg-[#1d1608]" />
          <span className="absolute bottom-[3%] right-[18.5%] h-[10%] w-[3%] rounded-full bg-[#1d1608]" />
        </span>
      </span>
    </span>
  );
}

type Service = (typeof SERVICES)[number];

// Walking into a door, like a camera: the whole hallway rushes toward the middle of the open doorway
// (the heading and the other doors fly past), the door swings aside, it gets dark, then the page opens.
type Zoom = { i: number; ox: number; oy: number; dx: number; dy: number; k: number; go: boolean };

// the screen goes dark at the end, in the page colour, so the new page opens from it
function ZoomFade({ go }: { go: boolean }) {
  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[200] bg-background"
      style={{ opacity: go ? 1 : 0, transition: "opacity 450ms ease-in 650ms" }}
    />,
    document.body
  );
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
  const router = useRouter();
  const doorEls = useRef<(HTMLElement | null)[]>([]);
  const sectionEl = useRef<HTMLElement>(null);
  const wasActive = useRef(false); // was this door already open when the finger / mouse went down?
  const [zoom, setZoom] = useState<Zoom | null>(null);

  // walk through a door: the camera dives into it, then that specialization's page opens
  const openDoor = (i: number) => {
    if (zoom) return;
    const href = `/${SERVICES[i].id}/`;
    const el = doorEls.current[i];
    const sec = sectionEl.current;
    if (!el || !sec || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    const r = el.getBoundingClientRect();
    const sr = sec.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.5; // the middle of the doorway
    setZoom({
      i,
      ox: cx - sr.left,
      oy: cy - sr.top,
      dx: vw / 2 - cx,
      dy: vh / 2 - cy,
      k: Math.max(vw / r.width, vh / r.height) * 2.4,
      go: false,
    });
    requestAnimationFrame(() => requestAnimationFrame(() => setZoom((z) => (z ? { ...z, go: true } : z))));
    setTimeout(() => router.push(href), 1150);
  };

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
    <section
      ref={sectionEl}
      aria-labelledby="specializations"
      className="mt-24"
      style={
        zoom
          ? {
              position: "relative",
              zIndex: 20,
              willChange: "transform, filter",
              transformOrigin: `${zoom.ox}px ${zoom.oy}px`,
              transform: zoom.go ? `translate(${zoom.dx}px, ${zoom.dy}px) scale(${zoom.k})` : "none",
              filter: zoom.go ? "blur(8px)" : "blur(0px)",
              transition: "transform 1100ms cubic-bezier(.55,0,.85,.35), filter 600ms ease-in 450ms",
            }
          : undefined
      }
    >
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
                        ref={(el) => {
                          doorEls.current[i] = el;
                        }}
                        aria-label={`${s.title}: ${s.text}. Click to open this door.`}
                        onPointerDown={() => {
                          wasActive.current = active === i;
                        }}
                        onClick={(e) => (e.detail === 0 || wasActive.current ? openDoor(i) : enter(i))}
                        onPointerEnter={(e) => e.pointerType === "mouse" && enter(i)}
                        onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
                        onFocus={() => enter(i)}
                        onBlur={leave}
                        className="block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        <DoorArt
                          index={i}
                          title={s.title}
                          open={active === i}
                          angle={zoom?.i === i && zoom.go ? 84 : 28}
                          dive={zoom?.i === i && zoom.go}
                        />
                      </button>
                    </div>

                    {/* the words, right beside the door */}
                    {active === i && !zoom && (
                      <div
                        className={`pointer-events-none absolute top-0 hidden w-80 rounded-2xl border border-foreground/20 bg-background/95 p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md transition-[opacity,translate] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] starting:opacity-0 motion-reduce:transition-none sm:block ${
                          wordsOnRight
                            ? "left-[calc(100%+0.75rem)] starting:-translate-x-3"
                            : "right-[calc(100%+0.75rem)] starting:translate-x-3"
                        }`}
                      >
                        <Info s={s} />
                        <p className="mt-5 text-sm font-semibold text-accent-fg">Click to open this door →</p>
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
              onClick={() => openDoor(SERVICES.indexOf(current))}
              className="mt-4 rounded-full border border-foreground/15 px-4 py-1.5 text-sm font-semibold text-accent-fg"
            >
              Open this door →
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-muted">Tap a door to see what is behind it.</p>
        )}
      </div>
      <p className="mt-6 hidden text-center text-sm text-muted sm:block">
        Put the mouse on a door to see what is behind it. Click it to walk in.
      </p>
      {zoom && <ZoomFade go={zoom.go} />}
    </section>
  );
}
