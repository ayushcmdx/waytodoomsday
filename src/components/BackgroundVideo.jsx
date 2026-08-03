import { useEffect, useRef, useState } from "react";

// List your clips here, in the order you want them to play.
// Files live in public/bg/ — reference them without the "public" prefix.
const PLAYLIST = [
  "/bg/doomsday.mp4",
  "/bg/doomsday-1.mp4",
  // add more filenames here if you drop more clips into public/bg/ —
  // the player loops back to the first one automatically after the last finishes.
];

export default function BackgroundVideo() {
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Swap source whenever the index changes, then play.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || PLAYLIST.length === 0) return;
    video.src = PLAYLIST[index];
    video.play().catch(() => {
      // Autoplay can be blocked before any user interaction on some
      // mobile browsers — it will start on the first tap/scroll instead.
    });
  }, [index]);

  const handleEnded = () => {
    setIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  // If a clip ever fails to load (bad path, missing file), skip to the
  // next one instead of the player silently freezing on a dead source.
  const handleError = () => {
    setIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  if (PLAYLIST.length === 0) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        autoPlay
        onEnded={handleEnded}
        onError={handleError}
      />
      {/* Keeps text readable over whatever is playing, at any scroll position */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/75 to-bg/95" />
    </div>
  );
}
