"use client";
import { useEffect } from "react";
import { SERVICES } from "../services";
import { DOOR_EVENT, clearQueuedDoor, queuedDoor, type DoorRequest } from "./DoorTransition";
import "../doors.css";

// Clicking a specialization in the nav (on the home page) plays this, like the reference site:
//   1. the page rushes down to the doors, blurred, like a very fast scroll
//   2. that door opens (the doors section opens it when the hash changes)
//   3. we walk in: the camera dives into the door (the doors section does it when the door is clicked)
//   4. it gets dark and the specialization's page opens
const RUSH_MS = 1500; // the scroll down to the doors (a higher number = slower)
const OPEN_MS = 1500; // the door swings open before we walk in (a higher number = slower)
const ARRIVE_MS = 900; // coming back from another specialization: the camera pulls back to the doors

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function DoorRush() {
  useEffect(() => {
    const html = document.documentElement;
    let busy = false;
    let frame = 0;
    const timers: number[] = [];

    // the door button of a specialization (its label starts with the title)
    const findDoor = (title: string) =>
      Array.from(document.querySelectorAll<HTMLButtonElement>("button[aria-label]")).find((b) =>
        b.getAttribute("aria-label")?.startsWith(`${title}:`)
      );

    // the door ends up a little below the middle of the screen
    const doorScrollTop = (door: HTMLElement) =>
      Math.max(0, window.scrollY + door.getBoundingClientRect().top + door.offsetHeight / 2 - window.innerHeight * 0.55);

    // we came from another specialization's page (DoorExit): the doors are already in view,
    // the camera pulls back from the old door, then the new door opens and we walk in
    const queued = queuedDoor();
    const queuedService = queued ? SERVICES.find((s) => s.id === queued) : undefined;
    const queuedDoorEl = queuedService ? findDoor(queuedService.title) : undefined;
    if (queuedService && queuedDoorEl) {
      busy = true;
      // the mouse may be over some other door while the page moves: it must not pick that one
      html.classList.add("door-lock");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        clearQueuedDoor();
        queuedDoorEl.click();
      } else {
        // wait two frames: the router scrolls to the top after a page change, we scroll after it
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            window.scrollTo({ top: doorScrollTop(queuedDoorEl), behavior: "instant" as ScrollBehavior });
            html.classList.add("door-arrive");
            timers.push(
              window.setTimeout(() => {
                clearQueuedDoor();
                html.classList.remove("door-arrive");
                window.history.replaceState(null, "", `#${queuedService.id}`);
                window.dispatchEvent(new Event("hashchange"));
                timers.push(window.setTimeout(() => queuedDoorEl.click(), OPEN_MS));
              }, ARRIVE_MS)
            );
          });
        });
      }
    }

    const onEnter = (ev: Event) => {
      const req = (ev as CustomEvent<DoorRequest>).detail;
      const service = SERVICES.find((s) => s.id === req.id);
      if (!service) return;

      const door = findDoor(service.title);
      if (!door) return; // no doors on this page: let the nav open the page itself
      req.handled = true;
      if (busy) return;
      busy = true;
      html.classList.add("door-lock"); // the mouse must not pick another door while the page moves

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
      const to = doorScrollTop(door);
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
      html.classList.remove("door-arrive");
      html.classList.remove("door-lock");
    };
  }, []);

  return null;
}
