import { useEffect, useRef, useState } from "react";

/**
 * Plays a looping playlist of clips as the background of whatever
 * section wraps it. The parent section must have `position: relative`
 * and `overflow: hidden` (already set up in index.astro).
 *
 * Usage:
 *   <SectionVideo client:load playlist={["/bg/doomsday.mp4"]} />
 *   <SectionVideo client:load playlist={["/bg/doomsday-1.mp4", "/bg/doomsday-2.mp4"]} />
 */
export default function SectionVideo({ playlist = [] }) {
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || playlist.length === 0) return;
    video.src = playlist[index];
    video.play().catch(() => {
      // Autoplay can be blocked until the first tap/scroll on some
      // mobile browsers — it'll start playing on that interaction instead.
    });
  }, [index, playlist]);

  const handleEnded = () => {
    setIndex((prev) => (prev + 1) % playlist.length);
  };

  if (playlist.length === 0) return null;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        autoPlay
        onEnded={handleEnded}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/75 to-bg/95" />
    </div>
  );
}
