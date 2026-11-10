"use client";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "../services";

// "Magic happens behind the doors": one arched door per specialization.
// Hover (or tap) a door and it swings open to show what is behind it.
const COLORS = ["#1f4fd8", "#6d4bd6", "#8fa9c4", "#d0605a", "#1f9d8f", "#d99a2b", "#c2559a"];

function Door({ index, id, title, text }: { index: number; id: string; title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const color = COLORS[index % COLORS.length];

  return (
    <div
      data-door
      style={{ transitionDelay: `${(index % 4) * 110}ms` }}
      className="w-[calc(50%-0.75rem)] translate-y-10 opacity-0 transition-[opacity,translate] duration-[800ms] ease-[cubic-bezier(.2,.8,.2,1)] data-[in=1]:translate-y-0 data-[in=1]:opacity-100 motion-reduce:transition-none sm:w-[calc(25%-1.125rem)]"
    >
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-label={`${title}: ${text}`}
        onClick={() => setOpen((v) => !v)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        className="relative mx-auto block aspect-[1/2.05] w-full max-w-[15rem] scroll-mt-24 cursor-pointer [perspective:1100px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {/* door frame (the arch) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-t-[999px] border border-foreground/15 bg-foreground/[0.07] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]"
        />

        {/* behind the door: a warm light and what I do */}
        <span
          className="absolute inset-[5%] flex flex-col items-center justify-end gap-2 overflow-hidden rounded-t-[999px] pb-[14%] pl-[20%] pr-3 text-center"
          style={{ background: "radial-gradient(120% 90% at 50% 100%, #fff1bd 0%, #e8b45a 45%, #6b3d12 100%)" }}
        >
          <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#4a2a08]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[clamp(0.7rem,1.05vw,0.95rem)] font-semibold leading-tight text-[#2e1904]">{title}</span>
          <span className="text-[clamp(0.6rem,0.85vw,0.8rem)] leading-snug text-[#4a2a08]">{text}</span>
        </span>

        {/* the door itself: swings open around its left edge */}
        <span
          aria-hidden="true"
          className="absolute inset-[5%] origin-left overflow-hidden rounded-t-[999px] shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] transition-transform duration-[750ms] ease-[cubic-bezier(.3,.8,.2,1)] [transform-style:preserve-3d]"
          style={{
            background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 70%, #000))`,
            transform: open ? "rotateY(-78deg)" : "rotateY(0deg)",
          }}
        >
          {/* wood grain */}
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 7px)",
            }}
          />
          {/* brass name plate */}
          <span className="absolute left-1/2 top-[27%] w-[74%] -translate-x-1/2 rounded-[2px] bg-[#ead8b2] px-1 py-1 text-center font-mono text-[clamp(6px,0.75vw,10px)] font-semibold uppercase leading-tight tracking-wider text-[#4a3515] shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
            {title.replace(" (AI)", "")}
          </span>
          {/* handle and keyhole */}
          <span className="absolute right-[11%] top-[60%] h-[1.7%] w-[22%] rounded-full bg-gradient-to-b from-[#f1e6c9] to-[#a38c5f] shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <span className="absolute right-[13%] top-[66%] h-[3.2%] w-[5%] rounded-full bg-[#2a2113]/80" />
        </span>
      </button>
    </div>
  );
}

export default function ServiceCards() {
  const box = useRef<HTMLDivElement>(null);

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

  return (
    <section aria-labelledby="specializations" className="mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent-fg">My specializations</p>
      <h2
        id="specializations"
        className="mx-auto mt-3 max-w-3xl text-center text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[1.05] tracking-tight"
      >
        Magic happens behind the doors
      </h2>
      <p className="mt-3 text-center text-sm text-muted">Hover a door (or tap it) to see what I do.</p>
      <div ref={box} className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-12 border-b border-foreground/15 pb-10">
        {SERVICES.map((s, i) => (
          <Door key={s.id} index={i} {...s} />
        ))}
      </div>
    </section>
  );
}
