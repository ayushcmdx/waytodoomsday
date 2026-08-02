import { useEffect, useRef, useState } from "react";

// Add/remove entries here to match however many clips you have (5-7 is fine).
// Files live in /public/bg/, so the path is just "/bg/filename.mp4".
const CLIPS = [
  "/bg/doomsday-1.mp4",
  "/bg/doomsday-2.mp4",
  "/bg/doomsday-3.mp4",
  "/bg/doomsday-4.mp4",
  "/bg/doomsday-5.mp4",
];

export default function HeroBackground() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef(null);

  // advance to the next clip when the current one finishes
  const handleEnded = () => {
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
        aria-hidden="true"
      >
        <source src={CLIPS[index]} type="video/mp4" />
      </video>
    </div>
  );
}
