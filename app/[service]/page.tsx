import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES } from "../services";
import "../doors.css";
import Nav from "../components/Nav";
import LocalTime from "../components/LocalTime";
import DoorExit from "../components/DoorExit";

// One page per specialization (/web-development/, /app-development/ ...), all built from this one template.
// Only these pages exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const s = SERVICES.find((x) => x.id === service);
  return s ? { title: `${s.title.replace(" (AI)", "")} | My Portfolio`, description: s.text } : {};
}

// placeholder projects: replace the names and the text with real ones later
const PROJECTS = [
  { name: "Project one", kind: "Placeholder" },
  { name: "Project two", kind: "Placeholder" },
  { name: "Project three", kind: "Placeholder" },
];

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const s = SERVICES.find((x) => x.id === service);
  if (!s) notFound();
  const title = s.title.replace(" (AI)", "");

  return (
    <main className="ambient-purple relative min-h-svh overflow-x-clip pb-24">
      {/* the page opens from the page colour, as if we just walked through the door */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[150] bg-background"
        style={{ animation: "door-open 700ms ease-out forwards" }}
      />

      {/* clicking another specialization in the nav: walk back out of this door first */}
      <DoorExit id={s.id} />

      {/* top bar, same as the home page */}
      <div className="relative z-30 px-6 pt-7">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[34px] items-center nav:mt-14">
            <Nav />
          </div>
        </div>
      </div>
      <div className="absolute right-[3.75rem] top-7 z-30 sm:right-24">
        <LocalTime />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6" style={{ animation: "door-rise 900ms cubic-bezier(.2,.8,.2,1) both" }}>
        <Link
          href="/#specializations"
          className="mt-16 inline-block text-sm text-muted transition-colors hover:text-accent-fg nav:mt-24"
        >
          ← Back to the doors
        </Link>

        <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-accent-fg">{s.tagline}</p>
        <h1 className="mt-3 text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[1] tracking-tight">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{s.text}</p>

        <ul className="mt-8 flex flex-wrap gap-2.5">
          {s.points.map((p) => (
            <li key={p} className="rounded-full border border-foreground/20 bg-surface/60 px-4 py-2 text-sm font-medium backdrop-blur">
              {p}
            </li>
          ))}
        </ul>

        <h2 className="mt-20 text-2xl font-semibold tracking-tight sm:text-3xl">Selected work</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {PROJECTS.map((p) => (
            <article
              key={p.name}
              className="group rounded-2xl border border-primary/30 bg-surface p-6 transition hover:border-primary hover:shadow-[0_0_40px_-10px_var(--primary)]"
            >
              <div className="aspect-[16/10] rounded-xl bg-foreground/[0.06]" aria-hidden="true" />
              <span className="mt-5 block text-xs font-semibold uppercase tracking-widest text-accent-fg">{title}</span>
              <h3 className="mt-2 text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted">Short project description here.</p>
              <span className="mt-5 inline-block text-sm text-accent-fg transition group-hover:translate-x-1">
                View project →
              </span>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
