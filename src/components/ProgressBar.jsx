export default function ProgressBar({ watchedCount, total }) {
  const pct = total === 0 ? 0 : Math.round((watchedCount / total) * 100);

  return (
    <div className="w-full">
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
        <div
          className="h-full bg-gradient-to-r from-accent-bright to-accent rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
