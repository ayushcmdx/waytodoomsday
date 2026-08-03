import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CHARACTERS } from "../data/characters.js";

const AUTO_INTERVAL = 5000;

export default function CharacterSpotlight() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % CHARACTERS.length);
    }, AUTO_INTERVAL);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (newIndex, dir) => {
    setDirection(dir);
    setIndex(newIndex);
    resetTimer();
  };

  const next = () => goTo((index + 1) % CHARACTERS.length, 1);
  const prev = () => goTo((index - 1 + CHARACTERS.length) % CHARACTERS.length, -1);

  const current = CHARACTERS[index];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, scale: 0.97 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="relative w-full max-w-xs mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/60"
    >
      {/* Poster area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={current.slug}
            src={current.poster}
            alt={current.name}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

        {/* Nav arrows */}
        <button
          onClick={prev}
          aria-label="Previous character"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60 hover:text-white transition-colors"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Next character"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60 hover:text-white transition-colors"
        >
          ›
        </button>

        {/* Label overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
            Character Spotlight
          </span>
          <h3 className="font-display text-2xl text-white leading-none mt-1">
            {current.name}
          </h3>
          <p className="text-xs text-muted mt-1">{current.tagline}</p>
        </div>
      </div>

      {/* CTA — real navigation to the character's dedicated page */}
      <div className="p-3">
        <a
          href={`/character/${current.slug}`}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2.5 rounded-full bg-accent text-white hover:bg-accent-bright transition-colors"
        >
          Watch {current.name} →
        </a>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {CHARACTERS.map((c, i) => (
            <button
              key={c.slug}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              aria-label={`Go to ${c.name}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-accent" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
