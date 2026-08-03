import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "./VideoPlayer.jsx";

const TYPE_LABEL = { movie: "Movie", series: "Series", special: "Special" };

const CF_BASE_URL = import.meta.env.PUBLIC_CF_BASE_URL;

function getClipUrl(item) {
  // movies.json stores only the filename in `clip`; the base domain
  // lives in .env (PUBLIC_CF_BASE_URL) so it never gets committed to git.
  if (!item.clip) return "";
  return `${CF_BASE_URL}/${item.clip}`;
}

function getTimeRemaining(releaseDate) {
  const diff = new Date(releaseDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return { days, hours };
}

function useCountdown(releaseDate) {
  const [timeLeft, setTimeLeft] = useState(() =>
    releaseDate ? getTimeRemaining(releaseDate) : null
  );

  useEffect(() => {
    if (!releaseDate) return;
    const tick = () => setTimeLeft(getTimeRemaining(releaseDate));
    tick();
    const id = setInterval(tick, 60 * 1000); // refresh every minute
    return () => clearInterval(id);
  }, [releaseDate]);

  return timeLeft;
}

export default function MovieCard({ item, watched, onToggleWatched, layout = "timeline", sortMode = "story" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const posterIsPlaceholder = item.poster?.includes("PLACEHOLDER");
  const timeLeft = useCountdown(item.releaseDate);
  const isUpcoming = !!timeLeft; // releaseDate exists and is in the future

  const closeModal = () => setIsPlaying(false);
  const openModal = () => {
    if (isUpcoming) return; // nothing to play yet
    setIsPlaying(true);
  };

  return (
    <>
      <motion.div
        id={item.id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ y: -6, scale: 1.015 }}
        className={`group relative scroll-mt-24 rounded-2xl overflow-hidden border transition-colors duration-300 bg-white/[0.06] backdrop-blur-xl shadow-xl shadow-black/50 ${
          watched
            ? "border-accent/60 shadow-accent/10"
            : "border-white/10 hover:border-white/25"
        } ${layout === "timeline" ? "w-full" : ""}`}
      >
        {/* subtle inner highlight for glass effect */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-60" />

        {/* Poster area */}
        <div className="relative aspect-[16/9] bg-black overflow-hidden">
          {posterIsPlaceholder ? (
            <div className="media-placeholder absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
              <span className="text-xs uppercase tracking-widest">Poster goes here</span>
              <span className="text-[10px] text-muted/60 font-mono">{item.poster}</span>
            </div>
          ) : (
            <img
              src={item.poster}
              alt={`${item.title} poster`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {isUpcoming ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-[2px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                Coming Soon
              </span>
              <span className="font-display text-lg text-white tracking-wide">
                {timeLeft.days}d {timeLeft.hours}h
              </span>
            </div>
          ) : (
            /* Center play button, appears on hover */
            <motion.button
              type="button"
              onClick={openModal}
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 m-auto w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label={`Play ${item.title} clip`}
            >
              <span className="text-xl translate-x-0.5">▶</span>
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="relative p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block bg-accent text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              {TYPE_LABEL[item.type] ?? item.type}
            </span>
            {!isUpcoming && (
            <motion.button
              type="button"
              onClick={() => onToggleWatched(item.id)}
              aria-pressed={watched}
              whileTap={{ scale: 0.92 }}
              className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-colors ${
                watched
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-muted border-white/15 hover:border-white/40 hover:text-white"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={watched ? "on" : "off"}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block"
                >
                  {watched ? "✓ Watched" : "Mark watched"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            )}
          </div>

          <h3 className="font-display text-xl tracking-wide leading-none mt-1">
            {item.title}
          </h3>
          <p className="text-sm text-muted leading-snug">{item.desc}</p>
          <p className="text-xs text-muted/70 mt-1 flex flex-wrap items-center gap-x-1.5">
            <span className={sortMode === "release" ? "text-white font-semibold" : ""}>
              {isUpcoming ? "Releases" : "Released"} {item.year}
            </span>
            <span className="text-muted/40">•</span>
            <span className={sortMode === "story" ? "text-white font-semibold" : ""}>
              Story {item.chronologicalYear}
            </span>
            {item.cast ? (
              <>
                <span className="text-muted/40">•</span>
                <span>{item.cast}</span>
              </>
            ) : null}
          </p>

          {isUpcoming ? (
            <span className="mt-1 inline-flex items-center gap-1.5 self-start text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-full bg-white/10 text-muted border border-white/15">
              ⏳ {timeLeft.days}d {timeLeft.hours}h until release
            </span>
          ) : (
            <button
              type="button"
              onClick={openModal}
              className="mt-1 inline-flex items-center gap-1.5 self-start text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-full bg-accent text-white hover:bg-accent-bright transition-colors"
            >
              ▶ Watch
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <VideoPlayer
                src={getClipUrl(item)}
                title={item.title}
                itemId={item.id}
                watched={watched}
                onToggleWatched={onToggleWatched}
                onClose={closeModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}