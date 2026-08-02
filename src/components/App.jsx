import { useEffect, useMemo, useState } from "react";
import movies from "../data/movies.json";
import MovieCard from "./MovieCard.jsx";
import ProgressBar from "./ProgressBar.jsx";

const STORAGE_KEY = "waytodoomsday:watched";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "movie", label: "Movies" },
  { key: "series", label: "Series" },
  { key: "special", label: "Special" },
];

function loadWatched() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export default function App() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState("timeline"); // "timeline" | "grid"
  const [watchedMap, setWatchedMap] = useState({});

  // Load persisted watched state on mount (client-only)
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

  const sorted = useMemo(
    () => [...movies].sort((a, b) => a.chronologicalYear - b.chronologicalYear),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (!q) return true;
      const haystack = `${item.title} ${item.desc} ${item.cast} ${item.year}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [sorted, query, typeFilter]);

  const watchedCount = useMemo(
    () => sorted.filter((item) => watchedMap[item.id]).length,
    [sorted, watchedMap]
  );

  return (
    <div className="w-full">
      {/* Controls row */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-3 justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[260px]">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 min-w-[260px] flex-1 max-w-sm shadow-inner shadow-black/40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
              <path d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="6" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, year, cast..."
              aria-label="Search timeline"
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted/70"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap" role="list" aria-label="Type filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full border transition-colors ${
                  typeFilter === f.key
                    ? "bg-accent text-white border-transparent shadow shadow-accent/30"
                    : "bg-transparent text-muted border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl p-1">
          <button
            onClick={() => setView("timeline")}
            aria-pressed={view === "timeline"}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
              view === "timeline" ? "bg-accent text-white" : "text-muted hover:text-white"
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
              view === "grid" ? "bg-accent text-white" : "text-muted hover:text-white"
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <ProgressBar watchedCount={watchedCount} total={sorted.length} />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-center text-muted py-16">
          Nothing matches "{query}". Try a different title, year, or cast member.
        </p>
      )}

      {/* Timeline view */}
      {view === "timeline" && filtered.length > 0 && (
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          {/* center line, desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-accent-bright to-accent rounded-full shadow-[0_0_20px_rgba(237,29,36,0.25)]" />

          <div className="flex flex-col gap-10 md:gap-14">
            {filtered.map((item, i) => (
              <div key={item.id} className="relative grid md:grid-cols-2 gap-6 md:gap-10 items-center">
                {/* dot on the center line */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-accent z-10" />

                {i % 2 === 0 ? (
                  <>
                    <MovieCard item={item} watched={!!watchedMap[item.id]} onToggleWatched={toggleWatched} />
                    <div className="hidden md:block" />
                  </>
                ) : (
                  <>
                    <div className="hidden md:block" />
                    <MovieCard item={item} watched={!!watchedMap[item.id]} onToggleWatched={toggleWatched} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && filtered.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
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
