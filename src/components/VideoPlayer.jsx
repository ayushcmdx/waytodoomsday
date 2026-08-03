import { useEffect, useRef, useState, useCallback } from "react";

const PROGRESS_PREFIX = "waytodoomsday:progress:";
const RESUME_THRESHOLD_SECONDS = 5; // don't bother resuming if within this many seconds of start/end
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const CONTROLS_HIDE_DELAY = 2800;

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function VideoPlayer({ src, title, itemId, watched, onToggleWatched, onClose }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const progressKey = itemId ? `${PROGRESS_PREFIX}${itemId}` : null;

  // ---- resume position on load ----
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    setLoading(false);

    if (progressKey) {
      const saved = parseFloat(window.localStorage.getItem(progressKey) || "0");
      if (
        saved > RESUME_THRESHOLD_SECONDS &&
        saved < video.duration - RESUME_THRESHOLD_SECONDS
      ) {
        video.currentTime = saved;
        setCurrentTime(saved);
      }
    }

    video.play().catch(() => {});
  };

  // ---- save progress periodically ----
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }

    if (progressKey && video.currentTime > 0) {
      window.localStorage.setItem(progressKey, String(video.currentTime));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    if (progressKey) window.localStorage.removeItem(progressKey);
    if (!watched && onToggleWatched && itemId) {
      onToggleWatched(itemId);
    }
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // ---- controls ----
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const skip = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
  }, []);

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const value = parseFloat(e.target.value);
    video.currentTime = value;
    setCurrentTime(value);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const value = parseFloat(e.target.value);
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const changeSpeed = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen?.();
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP unsupported — silently ignore
    }
  };

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setHasEnded(false);
    video.play().catch(() => {});
  };

  // ---- controls auto-hide ----
  const wakeControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying]);

  useEffect(() => {
    wakeControls();
    return () => clearTimeout(hideTimerRef.current);
  }, [isPlaying, wakeControls]);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const onKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "Escape":
          if (!document.fullscreenElement) onClose?.();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, skip, onClose]);

  const pct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden select-none"
      onMouseMove={wakeControls}
      onClick={() => {
        wakeControls();
      }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={handleError}
        onDoubleClick={toggleFullscreen}
        className="absolute inset-0 w-full h-full object-contain bg-black"
      />

      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="text-sm text-muted">This clip couldn't be loaded. It may be temporarily unavailable.</p>
          <button
            onClick={onClose}
            className="mt-1 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Replay overlay when ended */}
      {hasEnded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
          <button
            onClick={replay}
            aria-label="Replay"
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-colors text-2xl"
          >
            ↻
          </button>
          <span className="text-xs uppercase tracking-widest text-muted">Replay</span>
        </div>
      )}

      {/* Center play/pause tap target (click video toggles play) */}
      {!loading && !error && (
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="absolute inset-0 w-full h-full"
          tabIndex={-1}
        />
      )}

      {/* Top bar: title + close */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <h3 className="font-display text-white/90 text-sm tracking-wide uppercase truncate pr-4">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Bottom controls */}
      {!error && (
        <div
          className={`absolute bottom-0 left-0 right-0 px-3 sm:px-4 pb-3 pt-8 bg-gradient-to-t from-black/85 via-black/50 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Seek bar */}
          <div className="relative flex items-center h-4 mb-1 group/seek">
            <div className="absolute left-0 right-0 h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="absolute h-full bg-white/30" style={{ width: `${bufferedPct}%` }} />
              <div className="absolute h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek"
              className="relative w-full h-4 appearance-none bg-transparent cursor-pointer accent-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:opacity-0 group-hover/seek:[&::-webkit-slider-thumb]:opacity-100"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Play/pause */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors text-sm"
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              {/* Skip back */}
              <button
                onClick={() => skip(-10)}
                aria-label="Back 10 seconds"
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors text-xs"
              >
                ↺10
              </button>

              {/* Skip forward */}
              <button
                onClick={() => skip(10)}
                aria-label="Forward 10 seconds"
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors text-xs"
              >
                10↻
              </button>

              {/* Volume */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
                >
                  {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    showVolumeSlider ? "w-16 opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                    className="w-16 accent-accent"
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-[11px] font-mono text-muted ml-1 tabular-nums hidden sm:inline">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu((s) => !s)}
                  aria-label="Playback speed"
                  className="px-2 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors text-xs font-mono"
                >
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 rounded-lg overflow-hidden bg-black/90 backdrop-blur-md border border-white/10 shadow-xl min-w-[64px]">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`block w-full text-center px-3 py-1.5 text-xs font-mono hover:bg-white/10 transition-colors ${
                          s === playbackRate ? "text-accent" : "text-white/80"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PiP */}
              <button
                onClick={togglePiP}
                aria-label="Picture in picture"
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors text-xs"
              >
                ⧉
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors text-xs"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
