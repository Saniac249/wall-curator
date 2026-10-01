"use client";

import { useEffect, useRef } from "react";

import Konva from "konva";

import { Layer, Stage } from "react-konva";

import ArtworkItem from "./ArtworkItem";

import type { Artwork } from "@/features/artwork/artwork-types";

import { useCanvasSize } from "@/hooks/useCanvasSize";

type CanvasSize = {
  width: number;
  height: number;
};

type WallCanvasProps = {
  artworks: Artwork[];

  selectedId: string | null;

  onSelect: (id: string | null) => void;

  onArtworkChange: (id: string, updates: Partial<Artwork>) => void;

  onSizeChange: (size: CanvasSize) => void;
};

export default function WallCanvas({
  artworks,
  selectedId,
  onSelect,
  onArtworkChange,
  onSizeChange,
}: WallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { width, height } = useCanvasSize(containerRef);

  /*
    Report the real canvas dimensions
    back to Editor.

    The layout generator needs these
    dimensions to compose the wall.
  */

  useEffect(() => {
    if (width <= 0 || height <= 0) {
      return;
    }

    onSizeChange({
      width,
      height,
    });
  }, [width, height, onSizeChange]);

  function handleEmptyClick(
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) {
    const stage = event.target.getStage();

    /*
      Only deselect if the Stage itself
      was clicked.

      Clicking an artwork should keep
      that artwork selected.
    */

    if (event.target === stage) {
      onSelect(null);
    }
  }

  return (
    <div
      ref={containerRef}
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-[#efefef]
      "
    >
      {width > 0 && height > 0 && (
        <Stage
          width={width}
          height={height}
          onMouseDown={handleEmptyClick}
          onTouchStart={handleEmptyClick}
        >
          <Layer>
            {artworks.map((artwork) => (
              <ArtworkItem
                key={artwork.id}
                artwork={artwork}
                selected={selectedId === artwork.id}
                onSelect={() => onSelect(artwork.id)}
                onChange={(updates) => onArtworkChange(artwork.id, updates)}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
