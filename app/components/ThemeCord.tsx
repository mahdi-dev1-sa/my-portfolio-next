"use client";
import { useEffect, useRef } from "react";

/* ---------- size and physics settings ---------- */
const W = 120; // canvas width (px)
const REST = 130; // cord length at rest (px)
const MAX_PULL = 50; // max extra length while pulling (px)
const H = REST + MAX_PULL + 70; // canvas height (px)
const AX = 76; // anchor x inside the canvas
const AY = -8; // anchor y (hidden just above the screen)
const N = 14; // points in the rope
const SEG = N - 1;
const TRIGGER = 18; // pull distance (px) that flips the theme
const STEP = 1 / 60; // fixed physics step (seconds)

type P = { x: number; y: number; px: number; py: number };

function applyTheme(next: string) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* storage may be blocked: ignore */
  }
}

/* Flip the theme with a circle of light growing from the cord (View Transitions API). */
function toggleTheme(ox: number, oy: number) {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svt = (
    document as unknown as {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    }
  ).startViewTransition?.bind(document);

  if (svt && !reduce) {
    const t = svt(() => applyTheme(next));
    t.ready
      .then(() => {
        const r = Math.hypot(
          Math.max(ox, window.innerWidth - ox),
          Math.max(oy, window.innerHeight - oy),
        );
        root.animate(
          {
            clipPath: [
              `circle(0px at ${ox}px ${oy}px)`,
              `circle(${r}px at ${ox}px ${oy}px)`,
            ],
          },
          {
            duration: 800,
            easing: "cubic-bezier(.4,0,.2,1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        /* transition was skipped: the theme is already applied */
      });
    return;
  }
  root.classList.add("theme-anim");
  applyTheme(next);
  window.setTimeout(() => root.classList.remove("theme-anim"), 600);
}

type Api = {
  down: (e: React.PointerEvent) => void;
  move: (e: React.PointerEvent) => void;
  up: () => void;
  key: (e: React.KeyboardEvent) => void;
};

export default function ThemeCord() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<Api | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const segRest = REST / SEG;
    let segLen = segRest;
    const pts: P[] = Array.from({ length: N }, (_, i) => ({
      x: AX,
      y: AY + i * segRest,
      px: AX,
      py: AY + i * segRest,
    }));
    const bead = pts[N - 1];

    let dragging = false;
    let running = false;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let tx = bead.x;
    let ty = bead.y;
    let tvx = 0;
    let tvy = 0;
    let maxPull = 0;
    let moved = 0;
    let downX = 0;
    let downY = 0;
    let grabDX = 0;
    let grabDY = 0;

    /* ---------- physics (Verlet rope) ---------- */
    const pinned = (i: number) => i === 0 || (dragging && i === N - 1);

    const step = () => {
      if (dragging) {
        const pull = Math.max(0, Math.min(MAX_PULL, ty - (AY + REST)));
        const len = REST + pull;
        segLen = len / SEG;
        maxPull = Math.max(maxPull, pull);
        let dx = tx - AX;
        let dy = ty - AY;
        const d = Math.hypot(dx, dy) || 1;
        if (d > len) {
          dx = (dx / d) * len;
          dy = (dy / d) * len;
        }
        bead.x = AX + dx;
        bead.y = AY + dy;
        bead.px = bead.x;
        bead.py = bead.y;
        tvx *= 0.8;
        tvy *= 0.8;
      } else {
        segLen += (segRest - segLen) * 0.22;
      }

      for (let i = 1; i < N; i++) {
        if (pinned(i)) continue;
        const p = pts[i];
        const vx = (p.x - p.px) * 0.985;
        const vy = (p.y - p.py) * 0.985;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + (i >= N - 2 ? 1.1 : 0.5); // the bead is heavier
      }

      for (let k = 0; k < 12; k++) {
        pts[0].x = AX;
        pts[0].y = AY;
        for (let i = 0; i < SEG; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const diff = (d - segLen) / d;
          const wa = pinned(i) ? 0 : 1;
          const wb = pinned(i + 1) ? 0 : 1;
          const s = wa + wb;
          if (s === 0) continue;
          a.x += (dx * diff * wa) / s;
          a.y += (dy * diff * wa) / s;
          b.x -= (dx * diff * wb) / s;
          b.y -= (dy * diff * wb) / s;
        }
      }
    };

    /* ---------- drawing ---------- */
    const ropePath = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < N - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[N - 1].x, pts[N - 1].y);
    };

    const draw = () => {
      const cs = getComputedStyle(document.documentElement);
      const fg = cs.getPropertyValue("--foreground").trim() || "#ffffff";
      const accent = cs.getPropertyValue("--accent").trim() || "#22d3ee";
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // soft shadow of the cord
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3.4;
      ctx.translate(1.5, 2);
      ropePath();
      ctx.stroke();
      ctx.restore();

      // the cord
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2.2;
      ropePath();
      ctx.stroke();
      ctx.globalAlpha = 1;

      // the bead (teardrop), rotated along the last segment
      const a = pts[N - 2];
      const dx = bead.x - a.x;
      const dy = bead.y - a.y;
      const theta = Math.atan2(-dx, dy);
      ctx.save();
      ctx.translate(bead.x, bead.y);
      ctx.rotate(theta);
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.bezierCurveTo(2, 6, 8, 11, 8, 19);
      ctx.arc(0, 19, 8, 0, Math.PI, false);
      ctx.bezierCurveTo(-8, 11, -2, 6, 0, -1);
      ctx.closePath();
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.clip();
      const shade = ctx.createLinearGradient(-8, 6, 8, 28);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,.42)");
      ctx.fillStyle = shade;
      ctx.fillRect(-10, -2, 20, 34);
      const shine = ctx.createRadialGradient(-3, 14.5, 0.5, -3, 14.5, 9);
      shine.addColorStop(0, "rgba(255,255,255,.85)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.fillRect(-10, -2, 20, 34);
      ctx.restore();
    };

    /* ---------- animation loop (sleeps when everything is still) ---------- */
    const energy = () =>
      pts.reduce((s, p) => s + Math.abs(p.x - p.px) + Math.abs(p.y - p.py), 0);

    const frame = (t: number) => {
      if (!last) last = t;
      acc += Math.min((t - last) / 1000, 0.05);
      last = t;
      let n = 0;
      while (acc >= STEP && n < 4) {
        step();
        acc -= STEP;
        n++;
      }
      draw();
      if (!dragging && energy() < 0.03 && Math.abs(segLen - segRest) < 0.02) {
        running = false;
        last = 0;
        acc = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const beadScreen = () => {
      const r = canvas.getBoundingClientRect();
      return { x: r.left + bead.x, y: r.top + bead.y + 14 };
    };
    const tug = () => {
      bead.py = bead.y - 9; // a quick downward pull
      start();
    };

    /* ---------- pointer / keyboard ---------- */
    api.current = {
      down: (e) => {
        const r = canvas.getBoundingClientRect();
        grabDX = bead.x - (e.clientX - r.left);
        grabDY = bead.y - (e.clientY - r.top);
        tx = bead.x;
        ty = bead.y;
        tvx = 0;
        tvy = 0;
        maxPull = 0;
        moved = 0;
        downX = e.clientX;
        downY = e.clientY;
        dragging = true;
        start();
      },
      move: (e) => {
        if (!dragging) return;
        const r = canvas.getBoundingClientRect();
        const nx = e.clientX - r.left + grabDX;
        const ny = Math.max(20, e.clientY - r.top + grabDY);
        tvx = nx - tx;
        tvy = ny - ty;
        tx = nx;
        ty = ny;
        moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      },
      up: () => {
        if (!dragging) return;
        dragging = false;
        const cap = (v: number) => Math.max(-25, Math.min(25, v));
        bead.px = bead.x - cap(tvx);
        bead.py = bead.y - cap(tvy);
        const o = beadScreen();
        if (maxPull >= TRIGGER || moved < 4) {
          if (moved < 4) tug();
          toggleTheme(o.x, o.y);
        }
        start();
      },
      key: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const o = beadScreen();
          tug();
          toggleTheme(o.x, o.y);
        }
      },
    };

    draw();
    // redraw when the theme or the accent color changes
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-accent"],
    });
    // a tiny nudge after the preloader, so people notice the cord
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nudge = reduce
      ? 0
      : window.setTimeout(() => {
          bead.px = bead.x - 3;
          start();
        }, 4800);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(nudge);
      mo.disconnect();
      api.current = null;
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-0 z-40"
        style={{ width: W, height: H, viewTransitionName: "theme-cord" }}
      />
      {/* invisible, finger-sized handle placed over the bead at rest */}
      <button
        type="button"
        aria-label="Toggle light and dark mode"
        title="Pull me"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          api.current?.down(e);
        }}
        onPointerMove={(e) => api.current?.move(e)}
        onPointerUp={() => api.current?.up()}
        onPointerCancel={() => api.current?.up()}
        onKeyDown={(e) => api.current?.key(e)}
        className="fixed z-40 cursor-grab touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing"
        style={{ right: W - AX - 28, top: REST - 10, width: 56, height: 76 }}
      />
    </>
  );
}
