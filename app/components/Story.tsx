"use client";
import { useEffect, useRef } from "react";

// "My story": one big statement. The words light up one by one as you scroll through it.
const TEXT =
  "I'm a UI/UX designer and developer who builds apps, games and web experiences people enjoy using. I work across web, iOS, video editing, graphic design and AI, so an idea can go from a sketch to something you can tap, play or watch. I care about clean interfaces, smooth motion and details that feel considered.";
const WORDS = TEXT.split(" ");

export default function Story() {
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section enters at the bottom of the screen, 1 when it reaches the upper part
      const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      const lit = p * spans.length;
      spans.forEach((s, i) => {
        const a = Math.min(1, Math.max(0, lit - i));
        s.style.opacity = (0.18 + 0.82 * a).toFixed(3);
      });
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

  return (
    <section ref={box} id="my-story" aria-labelledby="my-story-title" className="mx-auto max-w-5xl scroll-mt-10 px-6 py-28 md:py-40">
      <p id="my-story-title" className="text-xs font-semibold uppercase tracking-widest text-accent-fg">
        My story
      </p>
      <p className="mt-6 text-[clamp(1.6rem,4.2vw,3.25rem)] font-medium leading-[1.2] tracking-tight">
        {WORDS.map((w, i) => (
          <span key={i} data-w style={{ opacity: 0.18 }} className="transition-opacity duration-150">
            {w}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
