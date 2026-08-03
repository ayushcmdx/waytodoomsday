import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center min-w-[3.25rem] sm:min-w-[4rem]">
      <div className="relative h-8 sm:h-12 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="block font-mono text-2xl sm:text-4xl font-bold text-green-500 tabular-nums"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
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
      <div className="text-green-500 font-display text-3xl tracking-wide">
        NOW IN THEATERS
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-4 sm:gap-6 px-5 py-4 sm:px-8 sm:py-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg shadow-black/30"
      aria-live="polite"
    >
      <Unit value={parts.days} label="Days" />
      <span className="text-green-500/40 text-2xl -mt-4">:</span>
      <Unit value={parts.hours} label="Hrs" />
      <span className="text-green-500/40 text-2xl -mt-4">:</span>
      <Unit value={parts.minutes} label="Min" />
      <span className="text-green-500/40 text-2xl -mt-4">:</span>
      <Unit value={parts.seconds} label="Sec" />
    </div>
  );
}