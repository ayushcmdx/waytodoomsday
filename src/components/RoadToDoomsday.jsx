import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import movies from "../data/movies.json";
import VideoPlayer from "./VideoPlayer.jsx";
import { useWatched } from "../hooks/useWatched.js";

const CF_BASE_URL = import.meta.env.PUBLIC_CF_BASE_URL;

function getClipUrl(item) {
  if (!item.clip) return "";
  return `${CF_BASE_URL}/${item.clip}`;
}

function isUpcoming(item) {
  if (!item.releaseDate) return false;
  return new Date(item.releaseDate).getTime() > Date.now();
}

export default function RoadToDoomsday() {
  const { watchedMap, toggleWatched } = useWatched();
  const [playingItem, setPlayingItem] = useState(null);

  // duplicate the full list so the marquee loops seamlessly
  const track = [...movies, ...movies];

  return (
    <section id="road-to-doomsday" className="scroll-mt-24 py-16 border-t border-white/5 overflow-hidden">
      <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-center mb-8 px-4">
        ROAD TO <span className="text-accent">DOOMSDAY</span>
      </h2>

      <div className="marquee-viewport">
        <div className="marquee-track">
          {track.map((item, i) => {
            const hidden = i >= movies.length;
            const upcoming = isUpcoming(item);
            const watched = !!watchedMap[item.id];

            return (
              <div
                key={item.id + "-" + i}
                aria-hidden={hidden}
                className={`marquee-card group relative rounded-2xl overflow-hidden border transition-colors ${
                  watched ? "border-accent/60" : "border-white/10 hover:border-accent/50"
                }`}
              >
                <img
                  src={item.poster}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {upcoming ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Coming Soon</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlayingItem(item)}
                    tabIndex={hidden ? -1 : 0}
                    aria-label={`Play ${item.title} clip`}
                    className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="text-lg translate-x-0.5">▶</span>
                  </button>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span
                    className={`inline-block ${
                      item.type === "series" ? "bg-steel" : "bg-accent"
                    } text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full`}
                  >
                    {item.type === "series" ? "Series" : "Movie"}
                  </span>
                  <h3 className="font-display text-lg text-white leading-none mt-1.5">{item.title}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {playingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
            onClick={() => setPlayingItem(null)}
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
                src={getClipUrl(playingItem)}
                title={playingItem.title}
                itemId={playingItem.id}
                watched={!!watchedMap[playingItem.id]}
                onToggleWatched={toggleWatched}
                onClose={() => setPlayingItem(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .marquee-viewport {
          width: 100%;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          padding: 0 1.5rem;
          animation: marquee-scroll 150s linear infinite;
        }
        .marquee-viewport:hover .marquee-track {
          animation-play-state: paused;
        }
        .marquee-card {
          flex: 0 0 auto;
          width: 220px;
          aspect-ratio: 3 / 4;
        }
        @media (min-width: 640px) {
          .marquee-card {
            width: 260px;
          }
        }
        @keyframes marquee-scroll {
          from { transform: translateX(-50%); }
          to { transform: translateX(0%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}