"use client";
import { useSyncExternalStore } from "react";

// "Local time" on a portfolio means the OWNER's time, whoever is visiting.
const TZ = "Africa/Algiers";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TZ,
});
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

// "8:51pm|7 November, 2026"
function getSnapshot() {
  const now = new Date();
  const time = timeFmt.format(now).replace(/\s/g, "").toLowerCase();
  const parts = dateFmt.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${time}|${get("day")} ${get("month")}, ${get("year")}`;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

export default function LocalTime() {
  // the server renders an empty value, so there is never a hydration mismatch
  const value = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const [time, date] = value ? value.split("|") : ["--:--", ""];

  return (
    <div className="inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-foreground/15 bg-surface/60 px-4 py-2 text-xs backdrop-blur">
      <span className="text-muted">Local time</span>
      <span className="font-semibold tabular-nums">{time}</span>
      {date && (
        <>
          <span aria-hidden="true" className="hidden size-1 rounded-full bg-muted sm:block nav:max-xl:hidden" />
          <span className="hidden text-muted sm:inline nav:max-xl:hidden">{date}</span>
        </>
      )}
    </div>
  );
}
