import { useEffect, useState } from "react";

// Edit this to the real target release date/time when known.
const TARGET_DATE = new Date("December 18, 2026 11:30:00");

function getTimeParts(target) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl sm:text-4xl font-bold text-accent tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted mt-1">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [parts, setParts] = useState(() => getTimeParts(TARGET_DATE));

  useEffect(() => {
    const id = setInterval(() => setParts(getTimeParts(TARGET_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  if (!parts) {
    return (
      <div className="text-accent font-display text-3xl tracking-wide">
        NOW IN THEATERS
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 sm:gap-8" aria-live="polite">
      <Unit value={parts.days} label="Days" />
      <span className="text-accent/40 text-2xl -mt-4">:</span>
      <Unit value={parts.hours} label="Hrs" />
      <span className="text-accent/40 text-2xl -mt-4">:</span>
      <Unit value={parts.minutes} label="Min" />
      <span className="text-accent/40 text-2xl -mt-4">:</span>
      <Unit value={parts.seconds} label="Sec" />
    </div>
  );
}
