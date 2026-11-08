"use client";
import { useEffect, useRef } from "react";
import "./steam-train.css";

const SKILLS: string[][] = [
  ["Web", "Development"],
  ["App", "Development"],
  ["Video", "Editing"],
  ["Game", "Development"],
  ["Artificial", "Intelligence (AI)"],
  ["UI/UX", "Design"],
  ["Graphic", "Design"],
];
const SPEED = 110; // px per second at scale 1

const CU = 'fill="url(#st-cu)" stroke="#6b432b" stroke-width="1.2"';
const BL = 'fill="url(#st-bl)" stroke="#52697f" stroke-width="1.4"';

const DEFS = `<svg width="0" height="0" aria-hidden="true"><defs>
  <linearGradient id="st-bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3d5e6"/><stop offset=".5" stop-color="#92acc6"/><stop offset="1" stop-color="#6c88a4"/></linearGradient>
  <linearGradient id="st-cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b184"/><stop offset=".55" stop-color="#b87a55"/><stop offset="1" stop-color="#85513a"/></linearGradient>
  <linearGradient id="st-pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#506a80"/><stop offset="1" stop-color="#2d4153"/></linearGradient>
  <pattern id="st-ribs" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="2.4" height="10" fill="#fff" opacity=".28"/><rect x="6" width="2.4" height="10" fill="#1b2c3c" opacity=".16"/></pattern>
</defs></svg>`;

const rivets = (x: number, y: number, n: number, gap: number, r = 2.6) =>
  Array.from({ length: n }, (_, i) => `<circle cx="${x + i * gap}" cy="${y}" r="${r}" ${CU} stroke-width=".8"/>`).join("");

const wheel = (cx: number, cy: number, r: number, pin = false) => {
  let spokes = "";
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    spokes += `<line x1="${(Math.cos(a) * r * 0.24).toFixed(1)}" y1="${(Math.sin(a) * r * 0.24).toFixed(1)}" x2="${(Math.cos(a) * r * 0.78).toFixed(1)}" y2="${(Math.sin(a) * r * 0.78).toFixed(1)}" stroke="#eaf2f9" stroke-width="1.6" opacity=".8"/>`;
  }
  return `<g transform="translate(${cx} ${cy})"><g class="st-spin" style="--st-r:${r}">
    <circle r="${r}" ${CU} stroke-width="1.6"/><circle r="${r * 0.8}" ${BL}/>${spokes}
    <circle r="${r * 0.24}" ${CU}/>${pin ? `<circle cx="12" r="5" ${CU}/>` : ""}</g></g>`;
};

const loco = () => `<svg class="st-loco" viewBox="0 0 480 300" role="presentation" aria-hidden="true">
  <ellipse cx="240" cy="274" rx="228" ry="5" fill="rgba(0,0,0,.2)"/>
  <g class="st-bob">
    <rect x="44" y="226" width="404" height="14" rx="3" ${CU}/>
    <polygon points="8,228 66,228 80,270 28,270" ${CU}/>
    <g stroke="#6b432b" stroke-width="2.4"><line x1="22" y1="232" x2="38" y2="268"/><line x1="34" y1="232" x2="48" y2="268"/><line x1="46" y1="232" x2="58" y2="268"/><line x1="58" y1="232" x2="68" y2="268"/></g>
    <rect x="56" y="128" width="252" height="102" rx="30" ${BL}/>
    <ellipse cx="190" cy="145" rx="92" ry="8" fill="#fff" opacity=".3"/>
    <rect x="112" y="128" width="12" height="102" ${CU}/><rect x="200" y="128" width="12" height="102" ${CU}/><rect x="288" y="128" width="16" height="102" ${CU}/>
    <rect x="124" y="176" width="76" height="9" rx="3" ${CU}/><circle cx="162" cy="180" r="7" ${CU}/>
    ${rivets(118, 140, 1, 0)}${rivets(118, 218, 1, 0)}${rivets(206, 140, 1, 0)}${rivets(206, 218, 1, 0)}
    <circle cx="66" cy="180" r="25" ${CU}/><circle cx="66" cy="180" r="16" ${BL}/><rect x="50" y="177" width="30" height="6" rx="3" ${CU}/>
    <rect x="86" y="108" width="38" height="24" ${CU}/><rect x="92" y="90" width="26" height="22" ${CU}/>
    <polygon points="68,56 142,56 118,94 92,94" ${BL}/><rect x="89" y="88" width="32" height="8" rx="2" ${CU}/>
    <rect x="64" y="42" width="82" height="16" rx="4" ${CU}/>${rivets(75, 50, 6, 11.5, 2.3)}
    <rect x="148" y="120" width="38" height="10" rx="2" ${CU}/>
    <path d="M151 120V102Q151 84 167 84Q183 84 183 102V120Z" ${BL}/><rect x="161" y="80" width="12" height="8" ${CU}/><circle cx="167" cy="78" r="8" ${CU}/>
    <rect x="208" y="122" width="30" height="8" rx="2" ${CU}/>
    <path d="M210 122V108Q210 94 223 94Q236 94 236 108V122Z" ${BL}/><circle cx="223" cy="90" r="7" ${CU}/>
    <rect x="308" y="106" width="144" height="124" ${BL}/><rect x="308" y="106" width="144" height="124" fill="url(#st-ribs)"/>
    <rect x="304" y="106" width="8" height="124" ${CU}/><rect x="448" y="106" width="8" height="124" ${CU}/>
    <rect x="320" y="122" width="48" height="58" rx="9" fill="#f7ecd6" stroke="#b87a55" stroke-width="5"/><line x1="344" y1="122" x2="344" y2="180" stroke="#b87a55" stroke-width="3"/><line x1="320" y1="151" x2="368" y2="151" stroke="#b87a55" stroke-width="3"/>
    <rect x="388" y="122" width="48" height="58" rx="9" fill="#f7ecd6" stroke="#b87a55" stroke-width="5"/><line x1="412" y1="122" x2="412" y2="180" stroke="#b87a55" stroke-width="3"/><line x1="388" y1="151" x2="436" y2="151" stroke="#b87a55" stroke-width="3"/>
    <rect x="308" y="198" width="144" height="12" ${CU}/>${rivets(320, 204, 7, 20)}
    <rect x="296" y="86" width="168" height="20" rx="8" ${CU}/>${rivets(310, 96, 8, 20.5)}
    <rect x="452" y="224" width="28" height="12" rx="4" ${CU}/><circle cx="474" cy="230" r="3" fill="#4b2d1d"/>
  </g>
  <g class="st-rod"><line x1="190" y1="242" x2="300" y2="228" stroke="#5a3826" stroke-width="10" stroke-linecap="round"/><line x1="190" y1="242" x2="300" y2="228" stroke="#d29a70" stroke-width="6" stroke-linecap="round"/><circle cx="190" cy="242" r="5" ${CU}/><circle cx="300" cy="228" r="5" ${CU}/></g>
  ${wheel(105, 251, 21)}${wheel(190, 242, 30)}${wheel(300, 228, 44, true)}${wheel(404, 248, 24)}
  <g transform="translate(105 40)">${[0, 1, 2, 3]
    .map(
      (i) =>
        `<g class="st-puff" style="--st-i:${i}"><g fill="#f6f1e8" stroke="#c3d5e4" stroke-width="2"><circle cx="-8" cy="3" r="10"/><circle cx="8" cy="2" r="12"/><circle cx="0" cy="-7" r="12"/></g></g>`
    )
    .join("")}</g>
</svg>`;

const wagon = (lines: string[], k: number) => {
  const label = lines.join(" ");
  const max = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(32, 206 / (max * 0.62));
  const y1 = 161 - fs * 0.2;
  const y2 = y1 + fs * 1.12;
  const txt = (dy: number, fill: string) =>
    lines
      .map(
        (l, i) =>
          `<text x="170" y="${((i ? y2 : y1) + dy).toFixed(1)}" text-anchor="middle" font-family="'Playfair Display',Georgia,serif" font-weight="800" font-size="${fs.toFixed(1)}" fill="${fill}">${l}</text>`
      )
      .join("");
  return `<div role="listitem" aria-label="${label}"><svg viewBox="0 0 340 300" role="img" aria-label="${label}">
    <ellipse cx="170" cy="274" rx="160" ry="5" fill="rgba(0,0,0,.2)"/>
    <g class="st-bob w" style="--st-k:${k}">
      <rect x="14" y="226" width="312" height="14" rx="3" ${CU}/>
      <rect x="0" y="224" width="22" height="12" rx="4" ${CU}/><rect x="318" y="224" width="22" height="12" rx="4" ${CU}/><circle cx="6" cy="230" r="3" fill="#4b2d1d"/><circle cx="334" cy="230" r="3" fill="#4b2d1d"/>
      <rect x="26" y="98" width="288" height="130" ${BL}/><rect x="26" y="98" width="288" height="130" fill="url(#st-ribs)"/>
      <rect x="22" y="98" width="10" height="130" ${CU}/><rect x="308" y="98" width="10" height="130" ${CU}/>
      <rect x="26" y="212" width="288" height="14" ${CU}/>${rivets(44, 219, 12, 23.5)}
      <rect x="52" y="116" width="236" height="92" rx="9" fill="url(#st-pl)" stroke="#b87a55" stroke-width="5"/>
      <rect x="59" y="123" width="222" height="78" rx="5" fill="none" stroke="#e8b184" stroke-width="1" opacity=".55"/>
      ${rivets(66, 130, 1, 0, 2.8)}${rivets(274, 130, 1, 0, 2.8)}${rivets(66, 194, 1, 0, 2.8)}${rivets(274, 194, 1, 0, 2.8)}
      ${txt(1.8, "#14212c")}${txt(0, "#f4dcb2")}
      <rect x="12" y="74" width="316" height="26" rx="10" ${CU}/><rect x="16" y="78" width="308" height="4" rx="2" fill="#fff" opacity=".25"/>${rivets(30, 91, 13, 23.3)}
    </g>
    ${wheel(78, 250, 22)}${wheel(262, 250, 22)}
  </svg></div>`;
};

const TRAIN_HTML = loco() + SKILLS.map(wagon).join("");

export default function SteamTrain() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const train = trainRef.current;
    if (!root || !stage || !train) return;

    const layout = () => {
      const vw = stage.clientWidth;
      const u = Math.min(1.15, Math.max(0.55, vw / 1100));
      const speed = SPEED * u;
      root.style.setProperty("--st-u", u.toFixed(3));
      root.style.setProperty("--st-speed", speed.toFixed(2));
      const tw = train.offsetWidth;
      train.style.setProperty("--st-from", `${vw}px`);
      train.style.setProperty("--st-to", `${-tw}px`);
      train.style.setProperty("--st-dur", `${((vw + tw) / speed).toFixed(2)}s`);
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(layout, 120);
    });
    ro.observe(stage);
    const io = new IntersectionObserver(([entry]) => {
      root.classList.toggle("is-off", !entry.isIntersecting);
    });
    io.observe(root);
    layout();

    return () => {
      ro.disconnect();
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <section ref={rootRef} className="steam-train" aria-labelledby="st-title">
      <h2 className="st-sr" id="st-title">My skills</h2>
      <div className="st-defs" aria-hidden="true" dangerouslySetInnerHTML={{ __html: DEFS }} />
      <div ref={stageRef} className="st-stage">
        <div ref={trainRef} className="st-train" role="list" dangerouslySetInnerHTML={{ __html: TRAIN_HTML }} />
        <div className="st-track" aria-hidden="true" />
      </div>
    </section>
  );
}
