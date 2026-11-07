"use client";
import { useEffect, useState } from "react";

// Placeholder anchors: replace each href later when the sections or pages exist.
const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Web Development", href: "#web-development" },
  { label: "App Development", href: "#app-development" },
  { label: "UI/UX Design", href: "#ui-ux-design" },
  { label: "Graphic Design", href: "#graphic-design" },
  { label: "My story", href: "#my-story" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  // close the mobile menu with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav aria-label="Main" className="relative z-30">
      {/* wide screens: links in a row */}
      <ul className="hidden items-center gap-7 text-sm nav:flex">
        {LINKS.map((l, i) => (
          <li key={l.label}>
            <a
              href={l.href}
              className={`transition-colors hover:text-accent-fg ${
                i === 0 ? "text-foreground" : "text-muted"
              }`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      {/* small screens: menu button + dropdown */}
      <div className="nav:hidden">
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="flex size-[34px] items-center justify-center rounded-xl border border-foreground/15 bg-surface/60 backdrop-blur transition hover:border-primary"
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 top-0 h-px w-4 bg-foreground transition ${
                open ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[6px] h-px w-4 bg-foreground transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[12px] h-px w-4 bg-foreground transition ${
                open ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        {open && (
          <>
            {/* click outside to close */}
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setOpen(false)}
            />
            <ul
              id="mobile-menu"
              className="absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl border border-foreground/15 bg-surface/95 p-2 text-sm shadow-xl backdrop-blur"
            >
              {LINKS.map((l, i) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-2 transition-colors hover:bg-foreground/5 hover:text-accent-fg ${
                      i === 0 ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </nav>
  );
}
