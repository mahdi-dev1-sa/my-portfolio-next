"use client";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { SOCIAL_BG } from "./socialBg";

// Two playing cards at the bottom of the site, one per social account.
// FRONT: the profile photo of that account. BACK: my own photo, with the link to the profile.
// They float slowly, like cards held in a hand. Put the mouse on one: it straightens up, lifts,
// and a small "Flip me" message appears. Click it to turn the card over and open the profile from the back.
const TIKTOK = "https://www.tiktok.com/@mahdidev1";
const INSTAGRAM = "https://www.instagram.com/mahdi.dev1/";

// The profile photos shown on the FRONT of the cards. Paste a photo here as a data: URL or a path.
// While one is empty, that card shows its icon on a colour background instead.
const TIKTOK_AVATAR = "";
const INSTAGRAM_AVATAR = "";

type CardProps = {
  href: string;
  name: string;
  handle: string;
  tilt: string; // resting angle of the card in the hand
  delay: string; // so the two cards do not float in step
  face: string; // background of the card
  ink: string; // text / icon colour on the card
  icon: ReactNode;
  avatar: string; // profile photo for the front ("" = none yet)
};

const lift = "[transform:rotate(0deg)_translateY(-18px)_scale(1.07)]";

function PlayingCard({ href, name, handle, tilt, delay, face, ink, icon, avatar }: CardProps) {
  const [flipped, setFlipped] = useState(false);
  const faceStyle: CSSProperties = { background: face, color: ink };

  return (
    <div
      style={{ "--tilt": tilt, animationDelay: delay } as CSSProperties}
      className={`animate-float group relative aspect-[5/7] w-40 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] [perspective:1000px] motion-reduce:animate-none motion-reduce:transition-none sm:w-52 ${
        flipped ? `z-10 ${lift}` : `[transform:rotate(var(--tilt))] hover:z-10 hover:${lift} focus-within:z-10 focus-within:${lift}`
      }`}
    >
      {/* the small message that shows when the mouse is on the card */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background opacity-0 shadow-lg transition duration-300 motion-reduce:transition-none ${
          flipped ? "" : "group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
        }`}
      >
        Flip me &#8635;
      </span>

      <div
        className="relative size-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* FRONT: the whole card is a button that turns it over */}
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={`${name} ${handle}: flip the card`}
          tabIndex={flipped ? -1 : 0}
          onClick={() => setFlipped(true)}
          style={faceStyle}
          className="absolute inset-0 cursor-pointer overflow-hidden rounded-2xl border border-white/20 text-left shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] outline-offset-4 transition-shadow duration-500 [backface-visibility:hidden] focus-visible:outline-2 focus-visible:outline-accent group-hover:shadow-[0_30px_60px_-14px_rgba(0,0,0,0.9)]"
        >
          {/* the profile photo fills the whole front, with a dark fade at the bottom for the name */}
          {avatar && (
            <>
              <span aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${avatar})` }} />
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
            </>
          )}

          {/* a soft shine that slides over the card on hover */}
          <span className="pointer-events-none absolute -inset-y-4 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 blur-md transition-all duration-700 group-hover:left-full group-hover:opacity-100" />

          {/* top-left corner, like a playing card */}
          <span className={`absolute left-3 top-2.5 flex flex-col items-center gap-0.5 leading-none ${avatar ? "text-white drop-shadow" : ""}`}>
            <span className="text-lg font-bold sm:text-xl">A</span>
            <span className="size-3.5 sm:size-4 [&>svg]:size-full">{icon}</span>
          </span>
          {/* bottom-right corner, upside down */}
          <span className={`absolute bottom-2.5 right-3 flex rotate-180 flex-col items-center gap-0.5 leading-none ${avatar ? "text-white drop-shadow" : ""}`}>
            <span className="text-lg font-bold sm:text-xl">A</span>
            <span className="size-3.5 sm:size-4 [&>svg]:size-full">{icon}</span>
          </span>

          {avatar ? (
            /* with a photo: just the name and the handle at the bottom */
            <span className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-0.5 px-4 text-center text-white">
              <span className="text-base font-bold drop-shadow sm:text-lg">{name}</span>
              <span className="max-w-full truncate text-xs font-medium opacity-90 sm:text-sm">{handle}</span>
            </span>
          ) : (
            /* no photo yet: big icon, the name and the handle */
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <span className="size-14 transition-transform duration-500 group-hover:scale-110 sm:size-[4.5rem] [&>svg]:size-full">{icon}</span>
              <span className="text-base font-bold sm:text-lg">{name}</span>
              <span className="max-w-full truncate text-xs font-medium opacity-80 sm:text-sm">{handle}</span>
            </span>
          )}
        </button>

        {/* BACK: my own photo, with the profile link on top of it */}
        <div
          aria-hidden={!flipped}
          style={{ transform: "rotateY(180deg)", background: "#0a0a0c" }}
          className="absolute inset-0 overflow-hidden rounded-2xl border border-white/20 shadow-[0_30px_60px_-14px_rgba(0,0,0,0.9)] [backface-visibility:hidden]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-cover"
            style={{ backgroundImage: `url(${SOCIAL_BG})`, backgroundPosition: "50% 35%" }}
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-4 pb-4 text-center text-white">
            <span className="max-w-full truncate text-sm font-bold drop-shadow sm:text-base">{handle}</span>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={flipped ? 0 : -1}
              className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm"
            >
              Open {name} &rarr;
            </a>
            <button
              type="button"
              tabIndex={flipped ? 0 : -1}
              onClick={() => setFlipped(false)}
              className="text-xs font-medium underline underline-offset-4 opacity-90 transition hover:opacity-100"
            >
              Flip back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// line icons: a music note (TikTok) and a rounded camera (Instagram)
const noteIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3v11.5a4 4 0 1 1-4-4" />
    <path d="M15 3c.3 2.6 2 4.4 5 4.7" />
  </svg>
);
const cameraIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
  </svg>
);

export default function SocialCards() {
  return (
    <section aria-labelledby="social-title" className="mx-auto mt-32 max-w-5xl px-6 pb-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-fg">Follow along</p>
      <h2 id="social-title" className="mt-3 text-[clamp(1.75rem,4.5vw,3rem)] font-semibold leading-[1.1] tracking-tight">
        Pick a card
      </h2>
      <p className="mx-auto mt-4 max-w-md text-base text-muted">Behind each card is my work, my process and what I am building now.</p>

      {/* the stage: no big photo any more, just a soft glow in the site colours, with the two cards in the middle */}
      <div
        className="relative mt-14 flex min-h-[28rem] items-center justify-center gap-6 overflow-hidden rounded-3xl border border-primary/30 px-4 py-20 sm:min-h-[32rem] sm:gap-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 40%, color-mix(in srgb, var(--primary) 40%, transparent), transparent 72%), radial-gradient(ellipse 50% 55% at 78% 80%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 70%), #0a0a0c",
        }}
      >
        <PlayingCard
          href={TIKTOK}
          name="TikTok"
          handle="@mahdidev1"
          tilt="-8deg"
          delay="0s"
          face="linear-gradient(160deg, #15151b 0%, #0a0a0c 60%, #1b1230 100%)"
          ink="#f4f4f6"
          icon={noteIcon}
          avatar={TIKTOK_AVATAR}
        />
        <PlayingCard
          href={INSTAGRAM}
          name="Instagram"
          handle="@mahdi.dev1"
          tilt="8deg"
          delay="-3s"
          face="linear-gradient(160deg, #6d4bd6 0%, #c2559a 55%, #f59e0b 100%)"
          ink="#ffffff"
          icon={cameraIcon}
          avatar={INSTAGRAM_AVATAR}
        />
      </div>
    </section>
  );
}
