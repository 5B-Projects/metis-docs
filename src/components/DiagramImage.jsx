import React, { useState } from "react";

export default function DiagramImage({ src, alt, ...props }) {
  const [zoom, setZoom] = useState(1);
  return (
    <span
      className="diagram-figure"
      role="group"
      aria-label={alt || "ロジック図"}
    >
      <span className="diagram-toolbar">
        <span>図を拡大して読む</span>
        <button
          type="button"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          disabled={zoom <= 0.5}
          aria-label="図を縮小"
        >
          −
        </button>
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button
          type="button"
          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          disabled={zoom >= 3}
          aria-label="図を拡大"
        >
          ＋
        </button>
        <button type="button" onClick={() => setZoom(1)}>
          リセット
        </button>
        <a href={src} target="_blank" rel="noopener noreferrer">
          SVGを開く ↗
        </a>
      </span>
      <span
        className="diagram-scroll"
        tabIndex={0}
        aria-label="図のスクロール領域"
      >
        <img
          {...props}
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            width: `${zoom * 100}%`,
            minWidth: `${zoom * 520}px`,
            maxWidth: "none",
          }}
        />
      </span>
    </span>
  );
}
