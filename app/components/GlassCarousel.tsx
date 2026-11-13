"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SERVICES } from "../services";

// A ribbon of glass cards that spirals around the visitor in 3D (like the "Vante" idea):
//  - the ribbon slides along a fixed curved rail: it starts small and far, swings close, wraps around and leaves
//  - each card then flies to its place in a calm grid
// One number (scroll progress p, 0..1) drives everything, so scrolling back reverses it perfectly.

const N = SERVICES.length;
const CARD_W = 2.1; // card size in world units (same ratio as the texture)
const CARD_H = 1.32;
const GAP = 0.03;
const STEP = CARD_W + GAP;
const NX = 28; // segments, so the card can bend along the rail
const NY = 3;
const TW = 1024;
const TH = 644;
const GZ = 8; // distance of the grid plane
const RIB_A = 0.14; // the ribbon runs between these two scroll positions
const RIB_B = 0.63;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/%&<>[]";
const MONO = `ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace`;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const out = (t: number) => 1 - (1 - t) ** 3;
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
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
  geo: THREE.PlaneGeometry;
  mat: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
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


// small line icons, one per specialization (drawn inside a box of size z at x,y)
function drawIcon(g: CanvasRenderingContext2D, id: string, x: number, y: number, z: number) {
  g.save();
  g.translate(x, y);
  g.scale(z / 76, z / 76);
  g.lineWidth = 3;
  g.lineCap = "round";
  g.lineJoin = "round";
  const rr = (a: number, b: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.roundRect(a, b, w, h, r);
    g.stroke();
  };
  const dotAt = (a: number, b: number, r: number) => {
    g.beginPath();
    g.arc(a, b, r, 0, Math.PI * 2);
    g.fill();
  };
  const s = 76;
  switch (id) {
    case "web-development": // browser window with code
      rr(0, s * 0.1, s, s * 0.8, 10);
      g.beginPath();
      g.moveTo(0, s * 0.3);
      g.lineTo(s, s * 0.3);
      g.stroke();
      dotAt(s * 0.14, s * 0.2, 2.5);
      dotAt(s * 0.26, s * 0.2, 2.5);
      g.beginPath();
      g.moveTo(s * 0.38, s * 0.5);
      g.lineTo(s * 0.26, s * 0.62);
      g.lineTo(s * 0.38, s * 0.74);
      g.moveTo(s * 0.62, s * 0.5);
      g.lineTo(s * 0.74, s * 0.62);
      g.lineTo(s * 0.62, s * 0.74);
      g.stroke();
      break;
    case "app-development": // phone
      rr(s * 0.22, 0, s * 0.56, s, 12);
      g.beginPath();
      g.moveTo(s * 0.42, s * 0.1);
      g.lineTo(s * 0.58, s * 0.1);
      g.moveTo(s * 0.42, s * 0.9);
      g.lineTo(s * 0.58, s * 0.9);
      g.stroke();
      break;
    case "video-editing": // clip with play + timeline
      rr(0, s * 0.1, s, s * 0.58, 10);
      g.beginPath();
      g.moveTo(s * 0.42, s * 0.25);
      g.lineTo(s * 0.62, s * 0.39);
      g.lineTo(s * 0.42, s * 0.53);
      g.closePath();
      g.stroke();
      g.beginPath();
      g.moveTo(0, s * 0.86);
      g.lineTo(s, s * 0.86);
      g.stroke();
      dotAt(s * 0.34, s * 0.86, 5);
      break;
    case "game-development": // gamepad
      rr(0, s * 0.25, s, s * 0.5, s * 0.22);
      g.beginPath();
      g.moveTo(s * 0.25, s * 0.42);
      g.lineTo(s * 0.25, s * 0.58);
      g.moveTo(s * 0.17, s * 0.5);
      g.lineTo(s * 0.33, s * 0.5);
      g.stroke();
      dotAt(s * 0.68, s * 0.44, 3.5);
      dotAt(s * 0.8, s * 0.56, 3.5);
      break;
    case "artificial-intelligence": { // sparkles
      const star = (cx: number, cy: number, r: number) => {
        g.beginPath();
        g.moveTo(cx, cy - r);
        g.quadraticCurveTo(cx, cy, cx + r, cy);
        g.quadraticCurveTo(cx, cy, cx, cy + r);
        g.quadraticCurveTo(cx, cy, cx - r, cy);
        g.quadraticCurveTo(cx, cy, cx, cy - r);
        g.stroke();
      };
      star(s * 0.42, s * 0.56, s * 0.38);
      star(s * 0.84, s * 0.18, s * 0.14);
      star(s * 0.86, s * 0.82, s * 0.1);
      break;
    }
    case "ui-ux-design": // bezier curve with anchor squares
      g.beginPath();
      g.moveTo(s * 0.1, s * 0.85);
      g.bezierCurveTo(s * 0.1, s * 0.1, s * 0.9, s * 0.9, s * 0.9, s * 0.15);
      g.stroke();
      rr(s * 0.02, s * 0.77, s * 0.16, s * 0.16, 3);
      rr(s * 0.82, s * 0.07, s * 0.16, s * 0.16, 3);
      break;
    default: // graphic design: circle + square + triangle
      g.beginPath();
      g.arc(s * 0.3, s * 0.34, s * 0.26, 0, Math.PI * 2);
      g.stroke();
      rr(s * 0.5, s * 0.1, s * 0.4, s * 0.4, 6);
      g.beginPath();
      g.moveTo(s * 0.5, s * 0.92);
      g.lineTo(s * 0.74, s * 0.52);
      g.lineTo(s * 0.98, s * 0.92);
      g.closePath();
      g.stroke();
  }
  g.restore();
}

// Draw a card: translucent glass, slow colour blobs, rim light and the title (letters scramble, then settle).
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
  const s = SERVICES[card.i];

  g.clearRect(0, 0, W, H);
  g.save();
  g.beginPath();
  g.roundRect(0, 0, W, H, 40);
  g.clip();

  const body = g.createLinearGradient(0, 0, W, H);
  // the glass fades from the site colour into its deeper partner colour (both follow the random accent)
  if (light) {
    body.addColorStop(0, "rgba(255,255,255,0.78)");
    body.addColorStop(1, rgba(primary, 0.3));
  } else {
    body.addColorStop(0, rgba(accent, 0.3));
    body.addColorStop(1, rgba(primary, 0.4));
  }
  g.fillStyle = body;
  g.fillRect(0, 0, W, H);

  const blob = (cx: number, cy: number, r: number, c: string, a: number) => {
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, rgba(c, a));
    gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  };
  blob(W * (0.3 + 0.18 * Math.sin(t * 0.6 + card.i)), H * (0.35 + 0.15 * Math.cos(t * 0.5 + card.i)), 460, primary, light ? 0.35 : 0.5);
  blob(W * (0.75 + 0.15 * Math.cos(t * 0.45 + card.i)), H * (0.7 + 0.12 * Math.sin(t * 0.7)), 380, accent, light ? 0.22 : 0.3);

  const sheen = g.createLinearGradient(0, 0, W, 0);
  sheen.addColorStop(0, rgba(fg, 0));
  sheen.addColorStop(0.5, rgba(fg, light ? 0.1 : 0.08));
  sheen.addColorStop(1, rgba(fg, 0));
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H * 0.45);
  g.restore();

  g.lineWidth = 4;
  g.strokeStyle = rgba(fg, light ? 0.35 : 0.5);
  g.beginPath();
  g.roundRect(2, 2, W - 4, H - 4, 38);
  g.stroke();

  // decoration: corner brackets, a faint dot grid, and a small line icon for this specialization
  g.strokeStyle = rgba(accent, 0.8);
  g.lineWidth = 4;
  g.lineCap = "round";
  const L = 34;
  const m = 26;
  for (const [cx, cy, dx, dy] of [
    [m, m, 1, 1],
    [W - m, m, -1, 1],
    [m, H - m, 1, -1],
    [W - m, H - m, -1, -1],
  ] as const) {
    g.beginPath();
    g.moveTo(cx + dx * L, cy);
    g.lineTo(cx, cy);
    g.lineTo(cx, cy + dy * L);
    g.stroke();
  }
  g.fillStyle = rgba(fg, light ? 0.22 : 0.2);
  for (let gx = 0; gx < 6; gx++) for (let gy = 0; gy < 4; gy++) {
    g.beginPath();
    g.arc(70 + gx * 20, H - 150 + gy * 20, 2.2, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(W - 70 - gx * 20, 160 - gy * 20 + 60, 2.2, 0, Math.PI * 2);
    g.fill();
  }
  // big icon in the middle-top, with a soft halo and a thin ring, so each card says what it is at a glance
  const IC = 150;
  const icx = W / 2;
  const icy = 50 + IC / 2;
  blob(icx, icy, 170, accent, light ? 0.3 : 0.34);
  g.strokeStyle = rgba(accent, 0.4);
  g.lineWidth = 3;
  g.beginPath();
  g.arc(icx, icy, IC / 2 + 26, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = rgba(accent, 1);
  g.fillStyle = rgba(accent, 1);
  g.shadowColor = rgba(accent, 0.85);
  g.shadowBlur = 18;
  drawIcon(g, s.id, icx - IC / 2, icy - IC / 2, IC);
  g.shadowBlur = 0;

  g.textBaseline = "alphabetic";
  g.textAlign = "left";
  g.font = `500 26px ${MONO}`;
  g.fillStyle = accent;
  g.fillText(`${String(card.i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`, 56, 74);
  g.fillStyle = rgba(fg, light ? 0.75 : 0.8);
  g.textAlign = "center";
  g.font = `500 27px ${MONO}`;
  g.fillText(s.tagline.toUpperCase(), W / 2, H - 52, W - 112);

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
  const y0 = H * (lines.length > 1 ? 0.64 : 0.7) + fs * 0.32 - ((lines.length - 1) * lh) / 2;
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

const SCRAMBLE_MS = 250 + Math.max(...SERVICES.map((s) => s.title.length)) * 38 + 120;

// card shader: shows the texture; if we see the card from behind, flip it so the text never reads mirrored
const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const FS = `uniform sampler2D map;varying vec2 vUv;
void main(){
  vec2 uv=vUv;if(!gl_FrontFacing)uv.x=1.-uv.x;
  vec4 c=texture2D(map,uv);
  if(c.a<.01)discard;
  gl_FragColor=c;
}`;

export default function GlassCarousel({ trackRef }: { trackRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const track = trackRef.current;
    if (!canvas || !track) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return; // no WebGL: the page continues without the ribbon
    }
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // colours pass straight through
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

    // ---------- the rail (fixed path, the ribbon only slides along it) ----------
    const SAMPLES = 1200;
    const pathP: THREE.Vector3[] = [];
    const pathT: THREE.Vector3[] = [];
    const PH0 = -1.5;
    const PH1 = Math.PI * 2 + 1.35;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const t = i / 160;
      const ph = mix(PH0, PH1, t);
      const cs = Math.cos(ph);
      const u = 2 * t - 1;
      // a shallow arc close to the camera, then long runs far behind it
      const depth = cs > 0 ? 7.6 + 16.4 * cs ** 0.9 : 7.6 + 2.2 * cs;
      const edge = 0.84 + 0.5 * span(0.14 - t, 0, 0.14) + 0.8 * span(t, 0.84, 1);
      pts.push(
        new THREE.Vector3(edge * Math.sin(ph) * depth * 0.561, 0.5 * Math.sign(u) * Math.abs(u) ** 1.4 * depth * 0.63, -depth)
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    curve.arcLengthDivisions = 1500;
    const PATH_L = curve.getLength();
    for (let i = 0; i <= SAMPLES; i++) {
      const u = i / SAMPLES;
      pathP.push(curve.getPointAt(u));
      pathT.push(curve.getTangentAt(u));
    }
    const op = new THREE.Vector3();
    const ot = new THREE.Vector3();
    const up = new THREE.Vector3();
    const vp = new THREE.Vector3();
    const Y = new THREE.Vector3(0, 1, 0);
    const at = (s: number) => {
      const f = clamp(s / PATH_L) * SAMPLES;
      const i = Math.min(SAMPLES - 1, Math.floor(f));
      const k = f - i;
      op.lerpVectors(pathP[i], pathP[i + 1], k);
      ot.lerpVectors(pathT[i], pathT[i + 1], k).normalize();
    };

    // ---------- cards ----------
    const cards: Card[] = SERVICES.map((_, i) => {
      const cv = document.createElement("canvas");
      cv.width = TW;
      cv.height = TH;
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.NoColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const geo = new THREE.PlaneGeometry(1, 1, NX, NY);
      const mat = new THREE.ShaderMaterial({
        vertexShader: VS,
        fragmentShader: FS,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { map: { value: tex } },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.visible = false;
      scene.add(mesh);
      return { i, cv, tex, geo, mat, mesh, born: -1, lastDraw: -1e9, drawn: false };
    });

    // ---------- floating particles around the rail ----------
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
    const COUNT = window.innerWidth < 768 ? 500 : 1300;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const roll = Float32Array.from({ length: COUNT }, () => Math.random());
    for (let k = 0; k < COUNT; k++) {
      pos[k * 3] = (Math.random() - 0.5) * 36;
      pos[k * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[k * 3 + 2] = -7 - Math.random() * 22;
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pgeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pmat = new THREE.PointsMaterial({
      size: 0.16,
      map: dot,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const cloud = new THREE.Points(pgeo, pmat);
    cloud.renderOrder = -1000;
    scene.add(cloud);

    const tmp = { r: 0, g: 0, b: 0 };
    const paint = () => {
      const css = getComputedStyle(document.documentElement);
      const get = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
      const light = document.documentElement.dataset.theme === "light";
      const a = new THREE.Color(get("--primary", "#7c5cff"));
      const b = new THREE.Color(get("--accent-fg", "#22d3ee"));
      const c = new THREE.Color(get("--foreground", "#f4f4f6"));
      for (let k = 0; k < COUNT; k++) {
        const x = roll[k] < 0.5 ? a : roll[k] < 0.85 ? b : c;
        x.getRGB(tmp, THREE.SRGBColorSpace); // plain sRGB values (the renderer does no conversion)
        col[k * 3] = tmp.r;
        col[k * 3 + 1] = tmp.g;
        col[k * 3 + 2] = tmp.b;
      }
      pgeo.attributes.color.needsUpdate = true;
      pmat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      pmat.needsUpdate = true;
    };
    paint();
    const mo = new MutationObserver(() => {
      paint();
      cards.forEach((c) => (c.drawn = false)); // redraw with the new colors
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });

    // ---------- size and layout ----------
    let W = 1;
    let H = 1;
    let asp = 1;
    let cols = 4;
    let rows = 2;
    let tanH = 0.3153;
    const resize = () => {
      W = canvas.clientWidth || window.innerWidth;
      H = canvas.clientHeight || window.innerHeight;
      asp = W / H;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, W < 768 ? 1.5 : 2));
      renderer.setSize(W, H, false);
      camera.aspect = asp;
      // below 16:9 keep the horizontal view fixed, so the ribbon is never squashed
      camera.fov = asp < 16 / 9 ? (Math.atan(0.561 / asp) * 360) / Math.PI : 35;
      camera.updateProjectionMatrix();
      tanH = Math.tan((camera.fov * Math.PI) / 360);
      cols = asp < 1.1 ? 2 : 4;
      rows = Math.ceil(N / cols);
    };
    resize();
    window.addEventListener("resize", resize);
    document.fonts?.ready.then(() => cards.forEach((c) => (c.drawn = false)));

    const grid = (i: number) => {
      const vh = 2 * GZ * tanH;
      const vw = vh * asp;
      const gw = vw * (cols === 4 ? 0.8 : 0.88);
      const gap = gw * 0.02;
      const cw = (gw - gap * (cols - 1)) / cols;
      const ch = cw / (CARD_W / CARD_H);
      const gh = ch * rows + gap * 1.6 * (rows - 1);
      const c = i % cols;
      const r = Math.floor(i / cols);
      // the last row can be shorter: centre it
      const inRow = r === rows - 1 ? N - r * cols : cols;
      const x0 = -((inRow - 1) / 2) * (cw + gap) + c * (cw + gap);
      return { x: x0, y: gh / 2 - ch / 2 - r * (ch + gap * 1.6), w: cw, h: ch, vw, vh, c, r };
    };

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

    // ---------- posing ----------
    const poseRibbon = (c: Card, centre: number) => {
      const pa = c.geo.attributes.position;
      for (let iy = 0; iy <= NY; iy++) {
        for (let ix = 0; ix <= NX; ix++) {
          const k = iy * (NX + 1) + ix;
          const lu = ix / NX - 0.5;
          const lv = 0.5 - iy / NY;
          at(centre + lu * CARD_W);
          // keep the sheet upright: "up" is world Y made perpendicular to the path direction
          up.copy(Y).addScaledVector(ot, -Y.dot(ot)).normalize();
          vp.copy(op).addScaledVector(up, lv * CARD_H);
          pa.setXYZ(k, vp.x, vp.y, vp.z);
        }
      }
      pa.needsUpdate = true;
    };
    const poseGrid = (c: Card, q: number) => {
      const g = grid(c.i);
      const pa = c.geo.attributes.position;
      const dx = (g.c - (cols - 1) / 2) * 1.2;
      const dy = g.r < rows / 2 ? 1 : -1;
      const ox = dx * g.vw * 0.62 * (1 - q);
      const oy = dy * g.vh * 0.5 * (1 - q);
      const tilt = (1 - q) * 0.22 * (g.c - (cols - 1) / 2 || 0.5) * dy;
      const cs = Math.cos(tilt);
      const sn = Math.sin(tilt);
      for (let iy = 0; iy <= NY; iy++) {
        for (let ix = 0; ix <= NX; ix++) {
          const k = iy * (NX + 1) + ix;
          const x = (ix / NX - 0.5) * g.w;
          const y = (0.5 - iy / NY) * g.h;
          pa.setXYZ(k, g.x + ox + x * cs - y * sn, g.y + oy + x * sn + y * cs, -GZ - (1 - q) * 0.6 * Math.sin((ix / NX) * Math.PI));
        }
      }
      pa.needsUpdate = true;
    };

    // ---------- frame ----------
    const frame = (now: number) => {
      p += (target - p) * 0.09;
      if (Math.abs(target - p) < 0.00005) p = target;
      mouse.sx += (mouse.x - mouse.sx) * 0.06;
      mouse.sy += (mouse.y - mouse.sy) * 0.06;

      // the name (in the page) reads these numbers: its two lines run across the screen in opposite directions
      track.style.setProperty("--run", mix(0, 110, span(p, 0, 0.5)).toFixed(2));
      const intro = 1 - span(p, 0, 0.06);
      track.style.setProperty("--intro", intro.toFixed(3));
      track.dataset.intro = intro > 0.3 ? "1" : "0";

      const pr = span(p, RIB_A, RIB_B);
      const total = PATH_L + N * STEP;
      const head = mix(0, total, pr);
      const end = PATH_L - CARD_W;
      const cap = cols * rows;

      for (const c of cards) {
        const s = head - c.i * STEP; // where this card's middle is on the rail
        const m = c.mesh;
        if (s < end) {
          m.visible = s > CARD_W;
          if (m.visible) {
            poseRibbon(c, s);
            at(s);
            m.renderOrder = Math.round(op.z * 10); // far cards first
          }
        } else if (c.i < cap) {
          // each card flies to its slot the moment it leaves the rail
          const st = mix(RIB_A, RIB_B, (end + c.i * STEP) / total);
          const q = out(span(p, st, st + 0.13));
          m.visible = q > 0.001;
          if (m.visible) {
            poseGrid(c, q);
            m.renderOrder = 100;
          }
        } else {
          m.visible = false;
        }
        if (!m.visible) continue;

        // title scramble: starts when the card reaches the middle part of the rail
        if (!reduce) {
          if (s > PATH_L * 0.4 && c.born < 0) c.born = now;
          if (s < PATH_L * 0.25) c.born = -1;
        }
        const scrambling = c.born >= 0 && now - c.born < SCRAMBLE_MS;
        if (!c.drawn || (scrambling && now - c.lastDraw > 40)) drawCard(c, now);
      }

      camera.rotation.y = reduce ? 0 : -mouse.sx * 0.025;
      camera.rotation.x = reduce ? 0 : -mouse.sy * 0.015;
      cloud.rotation.y = now * 0.00004 + p * 0.6;
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
        c.geo.dispose();
        c.mat.dispose();
        c.tex.dispose();
      });
      pgeo.dispose();
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
        style={{ opacity: "var(--intro, 1)" }}
        className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.2em] text-muted"
      >
        scroll ↓
      </div>
    </>
  );
}
