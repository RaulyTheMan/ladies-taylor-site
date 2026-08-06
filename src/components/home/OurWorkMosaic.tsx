// Placeholder mosaic — swap TILES for real 3:4 images / 9:16 video
// thumbnails once assets are ready. Deliberately unstyled-as-content
// (dashed border + icon + label) so it reads as scaffolding, not final
// copy. Every 4th tile is a video thumbnail; the rest are images.
const TILE_COUNT = 12;
const COLUMN_COUNT = 3;

const TILES = Array.from({ length: TILE_COUNT }, (_, i) => ({
  isVideo: i % 4 === 3,
}));

const COLUMNS = Array.from({ length: COLUMN_COUNT }, (_, col) =>
  TILES.filter((_, i) => i % COLUMN_COUNT === col)
);

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-black/25">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8.5" cy="9.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M21 15.5l-5-5-9 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white/40">
      <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
    </svg>
  );
}

export default function OurWorkMosaic() {
  return (
    <div className="flex gap-1.5">
      {COLUMNS.map((column, ci) => (
        <div key={ci} className="flex flex-1 flex-col gap-1.5">
          {column.map((tile, ti) => (
            <div
              key={ti}
              className={`flex flex-col items-center justify-center gap-1 rounded-squircle-xs border-2 border-dashed ${
                tile.isVideo
                  ? "aspect-[9/16] border-white/15 bg-lt-dark"
                  : "aspect-[3/4] border-black/15 bg-lt-gray"
              }`}
            >
              {tile.isVideo ? <PlayIcon /> : <ImageIcon />}
              <span
                className={`text-micro font-semibold uppercase tracking-wide ${
                  tile.isVideo ? "text-white/60" : "text-black/60"
                }`}
              >
                {tile.isVideo ? "Video" : "Image"}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
