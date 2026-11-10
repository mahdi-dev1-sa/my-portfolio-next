"use client";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "../services";

// "Magic happens behind the doors": one arched door per specialization.
// Hover (or tap) a door and it opens a little, inward, with the sound of a creaking door.
// What I do with that specialization shows on the side.
const COLORS = ["#1f4fd8", "#6d4bd6", "#8fa9c4", "#d0605a", "#1f9d8f", "#d99a2b", "#c2559a"];

// ---------- door sounds (made with the Web Audio API, so no sound files are needed) ----------
let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}
// a short burst of noise (the click of a latch, the thud of a door)
function noise(c: AudioContext, dur: number) {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}
function playDoor(kind: "open" | "close") {
  const c = audio();
  if (!c || c.state !== "running") return; // browsers keep sound locked until the first click
  const t = c.currentTime;
  const master = c.createGain();
  master.gain.value = kind === "open" ? 0.55 : 0.4;
  master.connect(c.destination);

  if (kind === "open") {
    // 1) latch click
    const click = noise(c, 0.05);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    const cg = c.createGain();
    cg.gain.setValueAtTime(0.9, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    click.connect(hp).connect(cg).connect(master);
    click.start(t);
    // 2) wooden creak: two rough tones that glide up and back down, with a little wobble
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(650, t + 0.08);
    bp.frequency.linearRampToValueAtTime(1150, t + 0.55);
    bp.frequency.linearRampToValueAtTime(800, t + 1.0);
    bp.Q.value = 5;
    const eg = c.createGain();
    eg.gain.setValueAtTime(0.0001, t + 0.08);
    eg.gain.linearRampToValueAtTime(0.5, t + 0.25);
    eg.gain.linearRampToValueAtTime(0.32, t + 0.7);
    eg.gain.exponentialRampToValueAtTime(0.0008, t + 1.05);
    bp.connect(eg).connect(master);
    const lfo = c.createOscillator();
    lfo.frequency.value = 24;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 14;
    lfo.connect(lfoGain);
    [
      { type: "sawtooth" as const, f0: 130, f1: 215, f2: 160 },
      { type: "square" as const, f0: 197, f1: 322, f2: 241 },
    ].forEach((o) => {
      const osc = c.createOscillator();
      osc.type = o.type;
      osc.frequency.setValueAtTime(o.f0, t + 0.08);
      osc.frequency.linearRampToValueAtTime(o.f1, t + 0.55);
      osc.frequency.linearRampToValueAtTime(o.f2, t + 1.0);
      lfoGain.connect(osc.frequency);
      osc.connect(bp);
      osc.start(t + 0.08);
      osc.stop(t + 1.1);
    });
    lfo.start(t + 0.08);
    lfo.stop(t + 1.1);
  } else {
    // soft thud when the door closes
    const th = noise(c, 0.18);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const tg = c.createGain();
    tg.gain.setValueAtTime(0.9, t);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    th.connect(lp).connect(tg).connect(master);
    th.start(t);
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
    const og = c.createGain();
    og.gain.setValueAtTime(0.8, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(og).connect(master);
    o.start(t);
    o.stop(t + 0.2);
  }
}

function Door({
  index,
  id,
  title,
  text,
  open,
  onOpen,
  onToggle,
}: {
  index: number;
  id: string;
  title: string;
  text: string;
  open: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const color = COLORS[index % COLORS.length];

  return (
    <div
      data-door
      style={{ transitionDelay: `${(index % 4) * 110}ms` }}
      className="w-[calc(50%-0.75rem)] translate-y-10 opacity-0 transition-[opacity,translate] duration-[800ms] ease-[cubic-bezier(.2,.8,.2,1)] data-[in=1]:translate-y-0 data-[in=1]:opacity-100 motion-reduce:transition-none sm:w-[calc(25%-1.125rem)] lg:w-[calc(25%-1.125rem)]"
    >
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-label={`${title}: ${text}`}
        onClick={onToggle}
        onPointerEnter={(e) => e.pointerType === "mouse" && onOpen()}
        className="relative mx-auto block aspect-[1/2.05] w-full max-w-[15rem] scroll-mt-24 cursor-pointer [perspective:1100px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {/* door frame (the arch) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-t-[999px] border border-foreground/15 bg-foreground/[0.07] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]"
        />

        {/* behind the door: a warm light */}
        <span
          aria-hidden="true"
          className="absolute inset-[5%] flex items-end justify-center overflow-hidden rounded-t-[999px] pb-[10%]"
          style={{ background: "radial-gradient(120% 90% at 50% 100%, #fff1bd 0%, #e8b45a 45%, #6b3d12 100%)" }}
        >
          <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#4a2a08]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </span>

        {/* the door itself: opens a little, inward, around its left edge */}
        <span
          aria-hidden="true"
          className="absolute inset-[5%] origin-left overflow-hidden rounded-t-[999px] shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] transition-transform duration-[750ms] ease-[cubic-bezier(.3,.8,.2,1)] [transform-style:preserve-3d]"
          style={{
            background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 70%, #000))`,
            transform: open ? "rotateY(28deg)" : "rotateY(0deg)",
          }}
        >
          {/* wood grain */}
          <span
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 7px)",
            }}
          />
          {/* raised panels, so it looks like a real wooden door */}
          <span className="absolute inset-x-[14%] top-[40%] bottom-[8%] rounded-[3px] border border-black/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.08)]" />

          {/* brass name plate: big and easy to read */}
          <span
            className="absolute left-1/2 top-[21%] w-[86%] -translate-x-1/2 rounded-[3px] border border-[#8a6a2b] px-1.5 py-1.5 text-center font-mono text-[clamp(9px,1.05vw,14px)] font-bold uppercase leading-tight tracking-[0.08em] text-[#2b1d08] shadow-[0_2px_4px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.7)]"
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
      </button>
    </div>
  );
}

export default function ServiceCards() {
  const box = useRef<HTMLDivElement>(null);
  const [sound, setSound] = useState(true);
  const [active, setActive] = useState<number | null>(null);

  const choose = (i: number | null) => {
    if (i === active) return;
    setActive(i);
    if (sound) playDoor(i === null ? "close" : "open");
  };
  const current = active === null ? null : SERVICES[active];

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

  // browsers only allow sound after the visitor has clicked or pressed a key once
  useEffect(() => {
    const unlock = () => {
      const c = audio();
      if (c && c.state === "suspended") c.resume();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
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
      <p className="mt-3 text-center text-sm text-muted">Hover a door (or tap it) to open it.</p>
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setSound((v) => !v)}
          aria-pressed={sound}
          className="rounded-full border border-foreground/15 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted transition hover:border-accent hover:text-accent-fg"
        >
          Sound: {sound ? "on" : "off"}
        </button>
      </div>
      <div className="mt-12 grid items-center gap-10 border-b border-foreground/15 pb-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div ref={box} className="flex flex-wrap justify-center gap-x-6 gap-y-12">
          {SERVICES.map((s, i) => (
            <Door
              key={s.id}
              index={i}
              id={s.id}
              title={s.title}
              text={s.text}
              open={active === i}
              onOpen={() => choose(i)}
              onToggle={() => choose(active === i ? null : i)}
            />
          ))}
        </div>

        {/* the words appear on the side of the open door */}
        <div aria-live="polite" className="min-h-[15rem] lg:min-h-[18rem]">
          {current ? (
            <div key={current.id} className="transition-[opacity,translate] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] starting:-translate-x-4 starting:opacity-0 motion-reduce:transition-none">
              <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {current.title.replace(" (AI)", "")}
              </h3>
              <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-fg">{current.tagline}</p>
              <ul className="mt-5 grid gap-3">
                {current.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-base font-medium">
                    <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-[11px] text-background">
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-muted lg:text-left">Open a door to see what is behind it.</p>
          )}
        </div>
      </div>
    </section>
  );
}
