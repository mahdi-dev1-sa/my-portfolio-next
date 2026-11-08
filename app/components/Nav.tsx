"use client";
import { useEffect, useRef, useState } from "react";

// Placeholder anchors: replace each href later when the sections or pages exist.
const HOME = { label: "Home", href: "#home" };
const SERVICES = [
  { label: "Web Development", href: "#web-development" },
  { label: "App Development", href: "#app-development" },
  { label: "Video Editing", href: "#video-editing" },
  { label: "Game Development", href: "#game-development" },
  { label: "Artificial Intelligence (AI)", href: "#artificial-intelligence" },
  { label: "UI/UX Design", href: "#ui-ux-design" },
  { label: "Graphic Design", href: "#graphic-design" },
];
const MORE = [
  { label: "My story", href: "#my-story" },
  { label: "Contact", href: "#contact" },
];

const linkBase = "transition-colors hover:text-accent-fg";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false); // small screens: the whole menu
  const [svcOpen, setSvcOpen] = useState(false); // wide screens: the Services dropdown
  const ref = useRef<HTMLElement>(null);

  // close with Escape, or by clicking anywhere outside the nav
  useEffect(() => {
    if (!menuOpen && !svcOpen) return;
    const close = () => {
      setMenuOpen(false);
      setSvcOpen(false);
    };
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
  }, [menuOpen, svcOpen]);

  return (
    <nav ref={ref} aria-label="Main" className="relative z-30">
      {/* ---------- wide screens: links in a row, services in a dropdown ---------- */}
      <ul className="hidden items-center gap-7 text-sm nav:flex">
        <li>
          <a href={HOME.href} className={`text-foreground ${linkBase}`}>
            {HOME.label}
          </a>
        </li>

        <li
          className="relative"
          onMouseEnter={() => setSvcOpen(true)}
          onMouseLeave={() => setSvcOpen(false)}
        >
          <button
            type="button"
            aria-expanded={svcOpen}
            aria-controls="services-menu"
            onClick={() => setSvcOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 text-muted ${linkBase}`}
          >
            Services
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`transition-transform ${svcOpen ? "rotate-180" : ""}`}
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>

          {svcOpen && (
            <div id="services-menu" className="absolute left-0 top-full z-30 pt-3">
              <ul className="w-64 rounded-2xl border border-foreground/15 bg-surface/95 p-2 shadow-xl backdrop-blur">
                {SERVICES.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={() => setSvcOpen(false)}
                      className="block rounded-xl px-3 py-2 text-muted transition-colors hover:bg-foreground/5 hover:text-accent-fg"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>

        {MORE.map((l) => (
          <li key={l.label}>
            <a href={l.href} className={`text-muted ${linkBase}`}>
              {l.label}
            </a>
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
              <a
                href={HOME.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 hover:text-accent-fg"
              >
                {HOME.label}
              </a>
            </li>
            <li className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-widest text-muted/70">
              Services
            </li>
            {SERVICES.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-muted transition-colors hover:bg-foreground/5 hover:text-accent-fg"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="mx-3 my-2 h-px bg-foreground/10" aria-hidden="true" />
            {MORE.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-muted transition-colors hover:bg-foreground/5 hover:text-accent-fg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
