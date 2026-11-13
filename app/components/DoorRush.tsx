"use client";
import { useEffect } from "react";
import { SERVICES } from "../services";
import { DOOR_EVENT, type DoorRequest } from "./DoorTransition";
import "../doors.css";

// Clicking a specialization in the nav (on the home page) plays this, like the reference site:
//   1. the page rushes down to the doors, blurred, like a very fast scroll
//   2. that door opens (the doors section opens it when the hash changes)
//   3. we walk in: the camera dives into the door (the doors section does it when the door is clicked)
//   4. it gets dark and the specialization's page opens
const RUSH_MS = 1500; // the scroll down to the doors (a higher number = slower)
const OPEN_MS = 1500; // the door swings open before we walk in (a higher number = slower)

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function DoorRush() {
  useEffect(() => {
    const html = document.documentElement;
    let busy = false;
    let frame = 0;
    const timers: number[] = [];

    const onEnter = (ev: Event) => {
      const req = (ev as CustomEvent<DoorRequest>).detail;
      const service = SERVICES.find((s) => s.id === req.id);
      if (!service) return;

      // the door button of that specialization (its label starts with the title)
      const door = Array.from(document.querySelectorAll<HTMLButtonElement>("button[aria-label]")).find((b) =>
        b.getAttribute("aria-label")?.startsWith(`${service.title}:`)
      );
      if (!door) return; // no doors on this page: let the nav open the page itself
      req.handled = true;
      if (busy) return;
      busy = true;

      // reduce motion: no rush, the doors section opens the page straight away
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        door.click();
        return;
      }

      const walkIn = () => {
        html.classList.remove("door-rush");
        // the doors section opens the door when the hash changes ...
        window.history.replaceState(null, "", `#${service.id}`);
        window.dispatchEvent(new Event("hashchange"));
        // ... and when the door is clicked, the camera dives into it and the page opens
        timers.push(window.setTimeout(() => door.click(), OPEN_MS));
      };

      // the scroll: the door ends up a little below the middle of the screen
      const from = window.scrollY;
      const r = door.getBoundingClientRect();
      const to = Math.max(0, from + r.top + r.height / 2 - window.innerHeight * 0.55);
      const start = performance.now();
      html.classList.add("door-rush");
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / RUSH_MS);
        // "instant": the page has smooth scrolling in CSS, which would fight this animation
        window.scrollTo({ top: from + (to - from) * ease(t), behavior: "instant" as ScrollBehavior });
        if (t < 1) frame = requestAnimationFrame(step);
        else walkIn();
      };
      frame = requestAnimationFrame(step);
    };

    window.addEventListener(DOOR_EVENT, onEnter);
    return () => {
      window.removeEventListener(DOOR_EVENT, onEnter);
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      html.classList.remove("door-rush");
    };
  }, []);

  return null;
}
