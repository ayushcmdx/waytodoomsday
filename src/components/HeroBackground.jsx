import { useEffect, useRef, useState } from "react";

// Add/remove entries here to match however many clips you have.
// Files live in /public/bg/, so the path is just "/bg/filename.mp4".
const CLIPS = [
  "/bg/doomsday.mp4",
  "/bg/doomsday-1.mp4",
];

export default function HeroBackground() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef(null);

  // advance to the next clip when the current one finishes
  const handleEnded = () => {
    setIndex((i) => (i + 1) % CLIPS.length);
  };

  // If a clip fails to load, skip to the next one instead of freezing
  const handleError = () => {
    setIndex((i) => (i + 1) % CLIPS.length);
  };

  // make sure the new clip actually starts playing after index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // autoplay can be blocked before user interaction; silently ignore
      });
    }
  }, [index]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        onError={handleError}
        aria-hidden="true"
      >
        <source src={CLIPS[index]} type="video/mp4" />
      </video>
    </div>
  );
}
