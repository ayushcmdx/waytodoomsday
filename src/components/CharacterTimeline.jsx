import { useMemo } from "react";
import { motion } from "framer-motion";
import movies from "../data/movies.json";
import MovieCard from "./MovieCard.jsx";
import { useWatched } from "../hooks/useWatched.js";

export default function CharacterTimeline({ movieIds = [] }) {
  const { watchedMap, toggleWatched } = useWatched();

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
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-sm text-muted mb-10 text-center"
      >
        <span className="text-white font-semibold">{watchedCount}</span> of{" "}
        {items.length} watched in this arc
      </motion.p>

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
    </div>
  );
}