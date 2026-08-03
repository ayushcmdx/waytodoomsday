import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import movies from "../data/movies.json";
import MovieCard from "./MovieCard.jsx";

const STORAGE_KEY = "waytodoomsday:watched";

function loadWatched() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export default function CharacterTimeline({ movieIds = [] }) {
  const [watchedMap, setWatchedMap] = useState({});

  useEffect(() => {
    setWatchedMap(loadWatched());
  }, []);

  const toggleWatched = (id) => {
    setWatchedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const items = useMemo(() => {
    const byId = new Map(movies.map((m) => [m.id, m]));
    return movieIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .sort((a, b) => a.chronologicalYear - b.chronologicalYear);
  }, [movieIds]);

  const watchedCount = items.filter((item) => watchedMap[item.id]).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-sm text-muted mb-8"
      >
        <span className="text-white font-semibold">{watchedCount}</span> of{" "}
        {items.length} watched in this arc
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
