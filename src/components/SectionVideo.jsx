import { useEffect, useRef, useState } from "react";

/**
 * Plays a looping playlist of clips as the background of whatever
 * section wraps it. The parent section must have `position: relative`
 * and `overflow: hidden` (already set up in index.astro).
 *
 * Usage:
 *   <SectionVideo client:load playlist={["/bg/doomsday.mp4"]} />
 *   <SectionVideo client:load playlist={["/bg/doomsday-1.mp4", "/bg/doomsday-2.mp4"]} />
 *
 * overlay: "strong" (default, for sections with dense content like the
 * timeline) or "soft" (lets more of the video show through, for the hero).
 */
export default function SectionVideo({ playlist = [], overlay = "strong" }) {
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);
  const isSingleClip = playlist.length === 1;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || playlist.length === 0) return;
    video.src = playlist[index];
    video.play().catch(() => {
      // Autoplay can be blocked until the first tap/scroll on some
      // mobile browsers — it'll start playing on that interaction instead.
    });
  }, [index, playlist]);

  // Only needed when there are 2+ clips to cycle through. With a single
  // clip, (0 + 1) % 1 always equals 0 — React sees no state change, the
  // effect above never re-runs, and the video dead-stops on its last
  // frame instead of restarting. The native `loop` attribute below
  // handles the single-clip case with zero JS.
  const handleEnded = () => {
    if (isSingleClip) return;
    setIndex((prev) => (prev + 1) % playlist.length);
  };

  if (playlist.length === 0) return null;

  const overlayClass =
    overlay === "soft"
      ? "bg-gradient-to-b from-black/35 via-black/40 to-bg/85"
      : "bg-gradient-to-b from-black/70 via-black/75 to-bg/95";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        autoPlay
        loop={isSingleClip}
        onEnded={handleEnded}
      />
      <div className={`absolute inset-0 ${overlayClass}`} />
    </div>
  );
}