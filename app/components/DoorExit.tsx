"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DOOR_EVENT, queueDoor, type DoorRequest } from "./DoorTransition";
import "../doors.css";

// On a specialization's page, clicking ANOTHER specialization in the nav does not jump straight to its page.
//   1. we walk back OUT of the door we are in: the page shrinks away, blurred and dark
//   2. the home page opens at the doors (DoorRush picks it up from here)
//   3. the new door opens, we walk in, and its page opens
const EXIT_MS = 700; // walking out of the door (a higher number = slower; keep it the same as door-exit in doors.css)

export default function DoorExit({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    const html = document.documentElement;
    let busy = false;
    let timer = 0;

    const onEnter = (ev: Event) => {
      const req = (ev as CustomEvent<DoorRequest>).detail;
      // reduce motion: no scene, let the nav open the page itself
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      req.handled = true;
      if (busy || req.id === id) return; // already walking out, or already inside this door
      busy = true;
      queueDoor(req.id);
      html.classList.add("door-exit");
      timer = window.setTimeout(() => router.push("/"), EXIT_MS);
    };

    window.addEventListener(DOOR_EVENT, onEnter);
    return () => {
      window.removeEventListener(DOOR_EVENT, onEnter);
      window.clearTimeout(timer);
      html.classList.remove("door-exit");
    };
  }, [id, router]);

  return null;
}
