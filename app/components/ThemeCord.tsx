"use client";
import { useRef, useState } from "react";

const REST = 84; // cord length at rest (px)
const MAX_PULL = 46; // how far it can be pulled (px)
const TRIGGER = 14; // pull distance that counts as a "pull"

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.classList.add("theme-anim");
  root.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* storage may be blocked: ignore */
  }
  window.setTimeout(() => root.classList.remove("theme-anim"), 600);
}

export default function ThemeCord() {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const maxPull = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    maxPull.current = 0;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const dy = Math.max(0, Math.min(MAX_PULL, e.clientY - startY.current));
    maxPull.current = Math.max(maxPull.current, dy);
    setPull(dy);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    setPull(0);
    // a pull, or a simple tap, flips the theme
    if (maxPull.current >= TRIGGER || maxPull.current < 3) toggleTheme();
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  };

  const length = REST + pull;

  return (
    <button
      type="button"
      aria-label="Toggle light and dark mode"
      title="Pull me"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="fixed right-6 top-0 z-40 w-10 cursor-grab touch-none select-none outline-none active:cursor-grabbing focus-visible:[&_.bead]:ring-2 focus-visible:[&_.bead]:ring-primary"
      style={{ height: REST + MAX_PULL + 30 }}
    >
      <span className={`absolute left-1/2 top-0 block -translate-x-1/2 ${dragging ? "" : "cord-swing"}`}>
        <span
          className="mx-auto block w-[2px] bg-foreground/40"
          style={{
            height: length,
            transition: dragging ? "none" : "height 550ms cubic-bezier(.34,1.8,.64,1)",
          }}
        />
        <span
          className="bead mx-auto -mt-px block h-6 w-[18px] rounded-full bg-accent shadow-[0_4px_14px_rgba(0,0,0,.35)]"
        />
      </span>
    </button>
  );
}
