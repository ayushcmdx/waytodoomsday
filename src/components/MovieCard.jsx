const TYPE_LABEL = { movie: "Movie", series: "Series", special: "Special" };

export default function MovieCard({ item, watched, onToggleWatched, layout = "timeline" }) {
  const posterIsPlaceholder = item.poster?.includes("PLACEHOLDER");

  return (
    <div
      className={`group relative bg-panel/80 backdrop-blur-md rounded-xl overflow-hidden shadow-lg shadow-black/60 border transition-all duration-300 ${
        watched ? "border-accent/50" : "border-white/10"
      } ${layout === "timeline" ? "w-full" : ""}`}
    >
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
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block bg-accent text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
            {TYPE_LABEL[item.type] ?? item.type}
          </span>
          <button
            type="button"
            onClick={() => onToggleWatched(item.id)}
            aria-pressed={watched}
            className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-colors ${
              watched
                ? "bg-white text-black border-white"
                : "bg-transparent text-muted border-white/15 hover:border-white/40 hover:text-white"
            }`}
          >
            {watched ? "✓ Watched" : "Mark watched"}
          </button>
        </div>

        <h3 className="font-display text-xl tracking-wide leading-none mt-1">
          {item.title}
        </h3>
        <p className="text-sm text-muted leading-snug">{item.desc}</p>
        <p className="text-xs text-muted/70 mt-1">
          Year: {item.year}
          {item.cast ? ` • ${item.cast}` : ""}
        </p>

        <a
          href={item.clipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 self-start text-[11px] font-bold uppercase tracking-wide px-3 py-2 rounded-full bg-accent text-white hover:bg-accent-bright transition-colors"
        >
          ▶ Watch
        </a>
      </div>
    </div>
  );
}