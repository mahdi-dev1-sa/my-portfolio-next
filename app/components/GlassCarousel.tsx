"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SERVICES } from "../services";

// A carousel of glass cards in 3D (one card big in the middle, its neighbours tilted at the edges).
// One number (scroll progress) drives everything. When a card reaches the middle,
// its title scrambles and then settles, and a twisting column of particles floats behind.

const N = SERVICES.length;
const CW = 3.66; // card size in world units (same ratio as the texture)
const CH = 2.3;
const TW = 1024;
const TH = 644;
const SPACING = 4.6;
const SHIFT_Y = -0.55; // the whole scene sits a little below the middle, under the name
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/%&<>[]";
const MONO = `ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace`;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const v = parseInt(n, 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
};

type Card = {
  i: number;
  cv: HTMLCanvasElement;
  tex: THREE.CanvasTexture;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  born: number; // when the title started to scramble (ms), or -1
  lastDraw: number;
  drawn: boolean;
};

function wrapLines(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

// Draw a card: translucent glass, slow colour blobs (so it feels alive), rim light and the title.
function drawCard(card: Card, now: number) {
  const g = card.cv.getContext("2d")!;
  const W = TW;
  const H = TH;
  const t = now / 1000;
  const css = getComputedStyle(document.documentElement);
  const get = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
  const light = document.documentElement.dataset.theme === "light";
  const primary = get("--primary", "#7c5cff");
  const accent = get("--accent-fg", "#22d3ee");
  const fg = get("--foreground", "#f4f4f6");
  const muted = get("--muted", "#9a9aa6");
  const s = SERVICES[card.i];

  g.clearRect(0, 0, W, H);
  g.save();
  g.beginPath();
  g.roundRect(0, 0, W, H, 40);
  g.clip();

  // glass body (translucent, so the particles behind show through)
  const body = g.createLinearGradient(0, 0, W, H);
  if (light) {
    body.addColorStop(0, "rgba(255,255,255,0.62)");
    body.addColorStop(1, "rgba(214,206,255,0.45)");
  } else {
    body.addColorStop(0, "rgba(150,165,255,0.30)");
    body.addColorStop(1, "rgba(50,38,110,0.26)");
  }
  g.fillStyle = body;
  g.fillRect(0, 0, W, H);

  // slow moving colour blobs
  const blob = (cx: number, cy: number, r: number, c: string, a: number) => {
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, rgba(c, a));
    gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  };
  blob(W * (0.3 + 0.18 * Math.sin(t * 0.6 + card.i)), H * (0.35 + 0.15 * Math.cos(t * 0.5 + card.i)), 460, primary, light ? 0.35 : 0.5);
  blob(W * (0.75 + 0.15 * Math.cos(t * 0.45 + card.i)), H * (0.7 + 0.12 * Math.sin(t * 0.7)), 380, accent, light ? 0.22 : 0.3);

  // soft diagonal sheen
  const sheen = g.createLinearGradient(0, 0, W, 0);
  sheen.addColorStop(0, rgba(fg, 0));
  sheen.addColorStop(0.5, rgba(fg, light ? 0.1 : 0.08));
  sheen.addColorStop(1, rgba(fg, 0));
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H * 0.45);
  g.restore();

  // rim light
  g.lineWidth = 4;
  g.strokeStyle = rgba(fg, light ? 0.35 : 0.5);
  g.beginPath();
  g.roundRect(2, 2, W - 4, H - 4, 38);
  g.stroke();

  // small labels
  g.textBaseline = "alphabetic";
  g.textAlign = "left";
  g.font = `500 26px ${MONO}`;
  g.fillStyle = accent;
  g.fillText(`${String(card.i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`, 56, 74);
  g.fillStyle = muted;
  g.textAlign = "center";
  g.font = `400 24px ${MONO}`;
  g.fillText(s.text.toUpperCase(), W / 2, H - 52, W - 112);

  // the title: lines are laid out from the final text, the letters scramble until they settle
  const fs = 74;
  g.font = `600 ${fs}px ${MONO}`;
  const anyG = g as unknown as { letterSpacing?: string };
  if ("letterSpacing" in g) anyG.letterSpacing = "4px";
  const lines = wrapLines(g, s.title.toUpperCase(), W - 140);
  const elapsed = card.born < 0 ? 1e9 : now - card.born;
  let idx = 0;
  const shown = lines.map((l) =>
    l
      .split("")
      .map((ch) => {
        const k = idx++;
        if (ch === " " || elapsed > 250 + k * 38) return ch;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      })
      .join("")
  );
  const lh = fs * 1.2;
  const y0 = H / 2 + fs * 0.32 - ((lines.length - 1) * lh) / 2;
  g.textAlign = "center";
  g.shadowColor = rgba(accent, 0.7);
  g.shadowBlur = 22;
  g.fillStyle = fg;
  shown.forEach((l, k) => g.fillText(l, W / 2, y0 + k * lh));
  g.shadowBlur = 0;
  if ("letterSpacing" in g) anyG.letterSpacing = "0px";

  card.tex.needsUpdate = true;
  card.lastDraw = now;
  card.drawn = true;
}

const scrambleDuration = () => {
  const longest = Math.max(...SERVICES.map((s) => s.title.length));
  return 250 + longest * 38 + 120;
};

export default function GlassCarousel({ trackRef }: { trackRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const track = trackRef.current;
    if (!canvas || !track) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return; // no WebGL: the page continues without the carousel
    }
    renderer.setClearColor(0, 0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const group = new THREE.Group();
    group.position.y = SHIFT_Y;
    scene.add(group);

    // ---------- cards ----------
    const cards: Card[] = SERVICES.map((_, i) => {
      const cv = document.createElement("canvas");
      cv.width = TW;
      cv.height = TH;
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), mat);
      mesh.visible = false;
      group.add(mesh);
      return { i, cv, tex, mesh, born: -1, lastDraw: -1e9, drawn: false };
    });

    // ---------- particle column behind the cards ----------
    const dotCv = document.createElement("canvas");
    dotCv.width = dotCv.height = 64;
    {
      const g = dotCv.getContext("2d")!;
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.4, "rgba(255,255,255,0.7)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
    }
    const dot = new THREE.CanvasTexture(dotCv);
    const COUNT = window.innerWidth < 768 ? 700 : 1700;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const roll = Float32Array.from({ length: COUNT }, () => Math.random());
    for (let k = 0; k < COUNT; k++) {
      const y = (k / COUNT) * 11 - 5.5 + (Math.random() - 0.5) * 0.3;
      const ang = y * 1.7 + Math.random() * 6.283;
      const rad = 0.2 + 0.7 * Math.abs(Math.sin(y * 0.8)) + Math.random() * 0.3;
      pos[k * 3] = Math.cos(ang) * rad;
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = -2.8 + Math.sin(ang) * rad * 0.8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pmat = new THREE.PointsMaterial({
      size: 0.075,
      map: dot,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      opacity: 0.95,
    });
    const column = new THREE.Points(geo, pmat);
    column.renderOrder = -100;
    group.add(column);

    const paint = () => {
      const css = getComputedStyle(document.documentElement);
      const get = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
      const light = document.documentElement.dataset.theme === "light";
      const a = new THREE.Color(get("--primary", "#7c5cff"));
      const b = new THREE.Color(get("--accent-fg", "#22d3ee"));
      const c = new THREE.Color(get("--foreground", "#f4f4f6"));
      for (let k = 0; k < COUNT; k++) {
        const x = roll[k] < 0.5 ? a : roll[k] < 0.85 ? b : c;
        col[k * 3] = x.r;
        col[k * 3 + 1] = x.g;
        col[k * 3 + 2] = x.b;
      }
      geo.attributes.color.needsUpdate = true;
      pmat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      pmat.needsUpdate = true;
    };
    paint();
    const mo = new MutationObserver(() => {
      paint();
      cards.forEach((c) => (c.drawn = false)); // redraw with the new colors
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });

    // ---------- size ----------
    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      const asp = w / h;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 768 ? 1.5 : 2));
      renderer.setSize(w, h, false);
      camera.aspect = asp;
      // on narrow screens move the camera back so the middle card still fits the width
      camera.position.z = clamp(4.5 / (2 * Math.tan((35 * Math.PI) / 360) * asp), 8, 18);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    document.fonts?.ready.then(() => cards.forEach((c) => (c.drawn = false)));

    // ---------- input ----------
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let target = 0;
    let p = 0;
    const readScroll = () => {
      const r = track.getBoundingClientRect();
      target = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    };
    readScroll();
    p = target;
    window.addEventListener("scroll", readScroll, { passive: true });

    // ---------- frame ----------
    let centre = -1;
    const DUR = scrambleDuration();
    const frame = (now: number) => {
      const t = now / 1000;
      p += (target - p) * 0.09;
      if (Math.abs(target - p) < 0.00005) p = target;
      mouse.sx += (mouse.x - mouse.sx) * 0.06;
      mouse.sy += (mouse.y - mouse.sy) * 0.06;
      track.style.setProperty("--p", p.toFixed(4));

      // the number of the card in the middle; it lingers on each card, then moves quickly to the next
      const c = p * (N - 1);
      const fl = Math.min(N - 1, Math.floor(c));
      const f = c - fl;
      const cur = fl + f * f * f * (f * (f * 6 - 15) + 10);

      const nearest = clamp(Math.round(cur), 0, N - 1);
      if (nearest !== centre) {
        centre = nearest;
        if (!reduce) cards[nearest].born = now;
        if (numRef.current) numRef.current.textContent = String(nearest + 1).padStart(2, "0");
      }

      for (const card of cards) {
        const d = card.i - cur;
        const ad = Math.abs(d);
        const m = card.mesh;
        m.visible = ad < 3;
        if (!m.visible) continue;

        // redraw when needed: first time, while scrambling, or slowly for the live colors of the middle card
        const scrambling = card.born >= 0 && now - card.born < DUR;
        const live = ad < 0.7 && !reduce && now - card.lastDraw > 66;
        if (!card.drawn || (scrambling && now - card.lastDraw > 40) || live) drawCard(card, now);

        const sg = Math.sign(d) || 1;
        const w = Math.max(0, 1 - ad); // 1 in the middle, 0 when one card away
        const idle = reduce ? 0 : 1;
        m.position.set(sg * SPACING * Math.pow(ad, 0.92), idle * Math.sin(t * 0.8 + card.i) * 0.06, -ad * 1.3);
        m.rotation.set(
          w * idle * (-mouse.sy * 0.12 + Math.sin(t * 0.7) * 0.03),
          -clamp(d, -1.4, 1.4) * 0.95 + w * idle * (mouse.sx * 0.18 + Math.sin(t * 0.5) * 0.05),
          w * idle * Math.sin(t * 0.4 + card.i) * 0.03,
          "YXZ"
        );
        m.scale.setScalar(1 - 0.08 * Math.min(ad, 2));
        m.material.opacity = 1 - clamp((ad - 1.5) / 1.2);
        m.renderOrder = -Math.round(ad * 10);
      }

      column.rotation.y = t * 0.22 + cur * 0.7;
      column.position.y = Math.sin(t * 0.3) * 0.15;
      renderer.render(scene, camera);
    };

    let raf = 0;
    let running = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      frame(now);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        readScroll();
        raf = requestAnimationFrame(loop);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(track);
    frame(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", readScroll);
      cards.forEach((c) => {
        c.mesh.geometry.dispose();
        c.mesh.material.dispose();
        c.tex.dispose();
      });
      geo.dispose();
      pmat.dispose();
      dot.dispose();
      renderer.dispose();
    };
  }, [trackRef]);

  return (
    <>
      <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-6 z-30 font-mono text-xs uppercase tracking-[0.2em] text-muted sm:left-8"
      >
        <span ref={numRef} className="text-accent-fg">01</span> / {String(N).padStart(2, "0")}
        <span className="hidden sm:inline"> &nbsp;· scroll</span>
      </div>
    </>
  );
}
