"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Each specialization has its own page (/web-development/ ...). The rest scroll to a section on the home page.
const HOME = { label: "Home", href: "/#home" };
const SERVICES = [
  { label: "Web Development", href: "/web-development/" },
  { label: "App Development", href: "/app-development/" },
  { label: "Video Editing", href: "/video-editing/" },
  { label: "Game Development", href: "/game-development/" },
  { label: "Artificial Intelligence (AI)", href: "/artificial-intelligence/" },
  { label: "UI/UX Design", href: "/ui-ux-design/" },
  { label: "Graphic Design", href: "/graphic-design/" },
];
const MORE = [
  { label: "My story", href: "/#my-story" },
  { label: "Contact", href: "/#contact" },
];

const linkBase = "transition-colors hover:text-accent-fg";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false); // small screens: the whole menu
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);

  // close with Escape, or by clicking anywhere outside the nav
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menuOpen]);

  return (
    <nav ref={ref} aria-label="Main" className="relative z-30">
      {/* ---------- wide screens: every link in one row ---------- */}
      <ul className="hidden flex-wrap items-center gap-x-3.5 gap-y-2 text-[13px] nav:flex">
        <li>
          <Link href={HOME.href} className={`text-foreground ${linkBase}`}>
            {HOME.label}
          </Link>
        </li>
        {[...SERVICES, ...MORE].map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
              className={`${path === l.href ? "text-foreground underline underline-offset-4" : "text-muted"} ${linkBase}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* ---------- small screens: menu button + one dropdown with everything ---------- */}
      <div className="nav:hidden">
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex size-[34px] items-center justify-center rounded-xl border border-foreground/15 bg-surface/60 backdrop-blur transition hover:border-primary"
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 top-0 h-px w-4 bg-foreground transition ${
                menuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[6px] h-px w-4 bg-foreground transition ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[12px] h-px w-4 bg-foreground transition ${
                menuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        {menuOpen && (
          <ul
            id="mobile-menu"
            className="absolute left-0 top-full z-30 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-foreground/15 bg-surface/95 p-2 text-sm shadow-xl backdrop-blur"
          >
            <li>
              <Link
                href={HOME.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 hover:text-accent-fg"
              >
                {HOME.label}
              </Link>
            </li>
            <li className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-widest text-muted/70">
              Services
            </li>
            {SERVICES.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-muted transition-colors hover:bg-foreground/5 hover:text-accent-fg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mx-3 my-2 h-px bg-foreground/10" aria-hidden="true" />
            {MORE.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-muted transition-colors hover:bg-foreground/5 hover:text-accent-fg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
