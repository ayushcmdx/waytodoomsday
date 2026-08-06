import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import movies from "../data/movies.json";
import MovieCard from "./MovieCard.jsx";
import { useWatched } from "../hooks/useWatched.js";

export default function CharacterTimeline({ movieIds = [] }) {
  const { watchedMap, toggleWatched } = useWatched();
  const [view, setView] = useState("timeline");

  const items = useMemo(() => {
    const byId = new Map(movies.map((m) => [m.id, m]));
    return movieIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .sort((a, b) => a.chronologicalYear - b.chronologicalYear);
  }, [movieIds]);

  const watchedCount = items.filter((item) => watchedMap[item.id]).length;

  return (
    <div id="timeline" className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 scroll-mt-24">
      <div className="flex flex-col items-center gap-4 mb-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-sm text-muted text-center"
        >
          <span className="text-white font-semibold">{watchedCount}</span> of{" "}
          {items.length} watched in this arc
        </motion.p>

        <div className="relative flex items-center gap-1 bg-white/10 rounded-xl p-1">
          {["timeline", "grid"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`relative px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                view === v ? "text-white" : "text-muted hover:text-white"
              }`}
            >
              {view === v && (
                <motion.span
                  layoutId="character-view-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-accent"
                />
              )}
              <span className="relative">{v === "timeline" ? "Timeline" : "Grid"}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "timeline" ? (
        <div className="relative">
          {/* the red spine */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/60 via-accent/20 to-transparent sm:-translate-x-1/2" />

          <div className="flex flex-col gap-10">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`relative flex flex-col sm:flex-row items-start gap-4 sm:gap-8 pl-10 sm:pl-0 ${
                  i % 2 === 1 ? "sm:flex-row-reverse" : ""
                }`}
              >
                {/* node dot on the spine */}
                <span
                  className={`absolute left-4 sm:left-1/2 top-2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-bg z-10 ${
                    watchedMap[item.id] ? "bg-accent" : "bg-muted/50"
                  }`}
                />
                <div className="sm:w-1/2 w-full">
                  <MovieCard
                    item={item}
                    watched={!!watchedMap[item.id]}
                    onToggleWatched={toggleWatched}
                    layout="timeline"
                  />
                </div>
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              watched={!!watchedMap[item.id]}
              onToggleWatched={toggleWatched}
              layout="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}