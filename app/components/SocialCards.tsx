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

// The profile picture (shrunk to about 6 KB and stored inline, so it works on GitHub Pages with any base path).
const PROFILE_AVATAR =
  "data:image/webp;base64,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";

// The profile pictures shown on the FRONT of the cards (the same one for both accounts for now).
// To use a different picture for one account, put its data: URL or path here. An empty one shows the icon instead.
const TIKTOK_AVATAR = PROFILE_AVATAR;
const INSTAGRAM_AVATAR = PROFILE_AVATAR;

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
  tint: string; // a light colour wash over the photo, in the colours of the platform
  chip: string; // background of the round icon badge on the name plate
};

const lift = "[transform:rotate(0deg)_translateY(-18px)_scale(1.07)]";

function PlayingCard({ href, name, handle, tilt, delay, face, ink, icon, avatar, tint, chip }: CardProps) {
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
          {/* the profile picture fills the whole front, with a wash in the platform colours and a dark fade at the bottom */}
          {avatar && (
            <>
              <span aria-hidden="true" className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${avatar})`, backgroundPosition: "50% 15%" }} />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: tint }} />
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
              {/* a thin printed frame inside the edge, like on a real card */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-1.5 rounded-xl border border-white/45" />
            </>
          )}

          {/* a soft shine that slides over the card on hover */}
          <span className="pointer-events-none absolute -inset-y-4 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 blur-md transition-all duration-700 group-hover:left-full group-hover:opacity-100" />

          {/* top-left corner, like a playing card */}
          <span className={`absolute left-3 top-2.5 flex flex-col items-center gap-0.5 leading-none ${avatar ? "text-white drop-shadow" : ""}`}>
            <span className="text-lg font-bold sm:text-xl">A</span>
            <span className="size-3.5 sm:size-4 [&>svg]:size-full">{icon}</span>
          </span>
          {/* bottom-right corner, upside down (the name plate takes its place when there is a photo) */}
          {!avatar && (
            <span className="absolute bottom-2.5 right-3 flex rotate-180 flex-col items-center gap-0.5 leading-none">
              <span className="text-lg font-bold sm:text-xl">A</span>
              <span className="size-3.5 sm:size-4 [&>svg]:size-full">{icon}</span>
            </span>
          )}

          {avatar ? (
            /* with a photo: a glass name plate at the bottom, with the platform badge */
            <span className="absolute inset-x-3.5 bottom-3.5 flex items-center gap-2.5 rounded-xl border border-white/25 bg-black/45 px-2.5 py-2 text-white backdrop-blur-md">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-white/50 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 sm:size-9"
                style={{ background: chip }}
              >
                <span className="size-4 sm:size-[1.15rem] [&>svg]:size-full">{icon}</span>
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-bold sm:text-base">{name}</span>
                <span className="truncate text-[11px] font-medium opacity-90 sm:text-xs">{handle}</span>
              </span>
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
          tint="linear-gradient(200deg, rgba(37,244,238,0.30) 0%, transparent 42%, rgba(254,44,85,0.38) 100%)"
          chip="linear-gradient(135deg, #0a0a0c 0%, #1b1230 100%)"
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
          tint="linear-gradient(200deg, rgba(109,75,214,0.38) 0%, transparent 45%, rgba(245,158,11,0.34) 100%)"
          chip="linear-gradient(135deg, #6d4bd6 0%, #c2559a 55%, #f59e0b 100%)"
        />
      </div>
    </section>
  );
}
