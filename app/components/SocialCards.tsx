import type { CSSProperties, ReactNode } from "react";

// Two playing cards at the bottom of the site, one per social account.
// They float slowly, like cards held in a hand; on hover (or touch) a card straightens up and lifts.
const TIKTOK = "https://www.tiktok.com/@mahdidev1";
const INSTAGRAM = "https://www.instagram.com/mahdi.dev1/";

type CardProps = {
  href: string;
  name: string;
  handle: string;
  tilt: string; // resting angle of the card in the hand
  delay: string; // so the two cards do not float in step
  face: string; // background of the card
  ink: string; // text / icon colour on the card
  icon: ReactNode;
};

function PlayingCard({ href, name, handle, tilt, delay, face, ink, icon }: CardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name}: ${handle} (opens in a new tab)`}
      style={{ "--tilt": tilt, animationDelay: delay } as CSSProperties}
      className="animate-float group relative block aspect-[5/7] w-40 rounded-2xl outline-offset-4 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] [transform:rotate(var(--tilt))] hover:z-10 hover:[transform:rotate(0deg)_translateY(-18px)_scale(1.07)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-accent focus-visible:[transform:rotate(0deg)_translateY(-18px)_scale(1.07)] motion-reduce:animate-none motion-reduce:transition-none sm:w-52"
    >
      <span
        className="absolute inset-0 overflow-hidden rounded-2xl border border-white/20 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-14px_rgba(0,0,0,0.9)]"
        style={{ background: face, color: ink }}
      >
        {/* a soft shine that slides over the card on hover */}
        <span className="pointer-events-none absolute -inset-y-4 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 blur-md transition-all duration-700 group-hover:left-full group-hover:opacity-100" />

        {/* top-left corner, like a playing card */}
        <span className="absolute left-3 top-2.5 flex flex-col items-center gap-0.5 leading-none">
          <span className="text-lg font-bold sm:text-xl">A</span>
          <span className="size-3.5 sm:size-4 [&>svg]:size-full">{icon}</span>
        </span>
        {/* bottom-right corner, upside down */}
        <span className="absolute bottom-2.5 right-3 flex rotate-180 flex-col items-center gap-0.5 leading-none">
          <span className="text-lg font-bold sm:text-xl">A</span>
          <span className="size-3.5 sm:size-4 [&>svg]:size-full">{icon}</span>
        </span>

        {/* the middle: big icon, the name and the handle */}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <span className="size-14 transition-transform duration-500 group-hover:scale-110 sm:size-[4.5rem] [&>svg]:size-full">{icon}</span>
          <span className="text-base font-bold sm:text-lg">{name}</span>
          <span className="max-w-full truncate text-xs font-medium opacity-80 sm:text-sm">{handle}</span>
        </span>
      </span>
    </a>
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

      <div className="mt-14 flex items-center justify-center gap-6 sm:gap-10">
        <PlayingCard
          href={TIKTOK}
          name="TikTok"
          handle="@mahdidev1"
          tilt="-8deg"
          delay="0s"
          face="linear-gradient(160deg, #15151b 0%, #0a0a0c 60%, #1b1230 100%)"
          ink="#f4f4f6"
          icon={noteIcon}
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
        />
      </div>
    </section>
  );
}
