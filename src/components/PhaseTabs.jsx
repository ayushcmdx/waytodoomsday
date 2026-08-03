import { useMemo } from "react";
import movies from "../data/movies.json";

export default function PhaseTabs({ activePhase, onSelect }) {
  const phases = useMemo(
    () => [...new Set(movies.map((m) => m.phase))].sort((a, b) => a - b),
    []
  );

  return (
    <div id="phases" className="scroll-mt-24 max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-6">
      <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
            activePhase === null ? "border-accent text-white" : "border-transparent text-muted hover:text-white"
          }`}
        >
          All
        </button>
        {phases.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
              activePhase === p ? "border-accent text-white" : "border-transparent text-muted hover:text-white"
            }`}
          >
            Phase {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* TODO once App.jsx is shared: render <PhaseTabs /> inside App.jsx,
   keep activePhase in App's state, and filter the movieIds passed to
   <CharacterTimeline /> by that phase before sorting. */