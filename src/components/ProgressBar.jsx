import { motion } from "framer-motion";

export default function ProgressBar({ watchedCount, total }) {
  const pct = total === 0 ? 0 : Math.round((watchedCount / total) * 100);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3 shadow-lg shadow-black/30">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-muted">
          <span className="text-white font-semibold">{watchedCount}</span> of{" "}
          {total} watched
        </span>
        <span className="text-sm font-mono text-accent font-bold">{pct}%</span>
      </div>
      <div
        className="h-2 rounded-full bg-white/5 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-accent-bright to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
      </div>
    </div>
  );
}
