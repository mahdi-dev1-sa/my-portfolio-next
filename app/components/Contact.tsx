"use client";
import { useRef, useState } from "react";
import { SERVICES } from "../services";

// Where messages go. The site has no server, so the form builds a ready message
// and opens WhatsApp or the visitor's email app to send it.
const WHATSAPP = "213656147021"; // 0656147021 in international format
const WHATSAPP_LABEL = "+213 656 147 021";
const EMAIL = "mahdidev455@gmail.com";

const BUDGETS = ["Not sure yet", "Under $200", "$200 - $500", "$500 - $1,500", "$1,500+"];
const DEADLINES = ["Flexible", "Within a week", "Within a month", "No rush"];

const field =
  "w-full rounded-2xl border border-foreground/15 bg-foreground/5 px-3.5 py-3 text-[15px] text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/25";
const label = "mb-2 block text-[13px] font-semibold";

export default function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(SERVICES[0].title.replace(" (AI)", ""));
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [deadline, setDeadline] = useState(DEADLINES[0]);
  const [sent, setSent] = useState(false);

  // the message the visitor sends to me
  const text = () =>
    [
      `Hi Mahdi, I'm ${name}.`,
      `Service: ${service}`,
      `Project: ${message}`,
      `Budget: ${budget}`,
      `Deadline: ${deadline}`,
      `My email: ${email}`,
    ].join("\n");

  const send = (via: "whatsapp" | "email") => {
    if (!form.current?.reportValidity()) return;
    if (via === "whatsapp") {
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text())}`, "_blank", "noopener");
    } else {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`${service} project - ${name}`)}&body=${encodeURIComponent(text())}`;
    }
    setSent(true);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="mx-auto mt-32 max-w-5xl scroll-mt-24 px-6">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent-fg">Contact</p>
      <h2
        id="contact-title"
        className="mx-auto mt-3 max-w-3xl text-center text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[1.05] tracking-tight"
      >
        Let&rsquo;s build something together
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-center text-lg leading-relaxed text-muted">
        Tell me what you need and which service it is for. I usually reply within a day.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        {/* the form */}
        <form
          ref={form}
          onSubmit={(e) => e.preventDefault()}
          className="rounded-3xl border border-primary/30 bg-surface p-7"
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className={label}>Name</label>
              <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
            </div>
            <div>
              <label htmlFor="c-email" className={label}>Email</label>
              <input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={field} />
            </div>
          </div>

          <p className={`${label} mt-[18px]`} id="c-service">What do you need?</p>
          <div role="group" aria-labelledby="c-service" className="flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const t = s.title.replace(" (AI)", "");
              const on = service === t;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setService(t)}
                  className={`rounded-full border px-3.5 py-2 text-[13px] transition ${
                    on
                      ? "border-accent bg-accent font-semibold text-accent-ink"
                      : "border-foreground/20 bg-surface/60 font-medium text-foreground hover:border-accent"
                  }`}
                >
                  {s.id === "artificial-intelligence" ? "AI" : t}
                </button>
              );
            })}
          </div>

          <label htmlFor="c-msg" className={`${label} mt-[18px]`}>Your project</label>
          <textarea
            id="c-msg"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="A few lines about what you want to build, and any links or examples you like."
            className={`${field} min-h-[120px] resize-y`}
          />

          <div className="mt-[18px] grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-budget" className={label}>Budget <span className="font-normal text-muted">(optional)</span></label>
              <select id="c-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={field}>
                {BUDGETS.map((b) => <option key={b} className="bg-surface">{b}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="c-deadline" className={label}>Deadline <span className="font-normal text-muted">(optional)</span></label>
              <select id="c-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={field}>
                {DEADLINES.map((d) => <option key={d} className="bg-surface">{d}</option>)}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => send("whatsapp")}
            className="glow-accent mt-6 w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-accent-ink transition hover:brightness-110"
          >
            Send on WhatsApp
          </button>
          <button
            type="button"
            onClick={() => send("email")}
            className="mt-3 w-full rounded-full border border-primary/50 px-6 py-3 text-base text-foreground transition hover:border-accent hover:text-accent-fg"
          >
            Send by email
          </button>
          <p aria-live="polite" className="mt-4 min-h-5 text-center text-sm font-semibold text-accent-fg">
            {sent ? "Your message is ready. Just press send in the app that opened." : ""}
          </p>
        </form>

        {/* direct links */}
        <aside className="h-fit rounded-3xl border border-primary/30 bg-surface p-7">
          <h3 className="text-xl font-semibold">Prefer to chat?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">Message me directly, the fastest way to get an answer.</p>

          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center gap-3.5 rounded-2xl border border-foreground/15 px-4 py-4 transition hover:-translate-y-0.5 hover:border-accent"
          >
            <span className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-[#25d366]" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" /></svg>
            </span>
            <span>
              <b className="block text-[15px]">WhatsApp</b>
              <span className="text-[13px] text-muted">{WHATSAPP_LABEL}</span>
            </span>
            <span className="ml-auto text-accent-fg" aria-hidden="true">&rarr;</span>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="mt-4 flex items-center gap-3.5 rounded-2xl border border-foreground/15 px-4 py-4 transition hover:-translate-y-0.5 hover:border-accent"
          >
            <span className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-primary/70" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            </span>
            <span>
              <b className="block text-[15px]">Email</b>
              <span className="text-[13px] text-muted">{EMAIL}</span>
            </span>
            <span className="ml-auto text-accent-fg" aria-hidden="true">&rarr;</span>
          </a>

          <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            Available for work
          </p>
        </aside>
      </div>
    </section>
  );
}
