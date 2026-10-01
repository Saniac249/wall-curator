"use client";

import { useEffect, useRef, useState } from "react";

import Konva from "konva";

import { Image as KonvaImage, Transformer } from "react-konva";

import type { Artwork } from "@/features/artwork/artwork-types";

type ArtworkItemProps = {
  artwork: Artwork;
  selected: boolean;

  onSelect: () => void;

  onChange: (updates: Partial<Artwork>) => void;
};

export default function ArtworkItem({
  artwork,
  selected,
  onSelect,
  onChange,
}: ArtworkItemProps) {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();

    img.onload = () => {
      setImage(img);
    };

    img.src = artwork.src;
  }, [artwork.src]);

  useEffect(() => {
    if (!selected) return;
    if (!imageRef.current) return;
    if (!transformerRef.current) return;

    transformerRef.current.nodes([imageRef.current]);

    transformerRef.current.getLayer()?.batchDraw();
  }, [selected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image ?? undefined}
        x={artwork.x}
        y={artwork.y}
        width={artwork.width}
        height={artwork.height}
        rotation={artwork.rotation}
        draggable
        shadowColor="black"
        shadowBlur={selected ? 14 : 8}
        shadowOpacity={selected ? 0.18 : 0.1}
        shadowOffsetY={selected ? 6 : 3}
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onSelect}
        onDragEnd={(event) => {
          onChange({
            x: event.target.x(),
            y: event.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;

          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          const width = node.width() * scaleX;

          const height = node.height() * scaleY;

          // Konva transforms using scale.
          // We convert that back into actual
          // width/height and reset scale.
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),

            width: Math.max(50, width),

            height: Math.max(50, height),

            rotation: node.rotation(),
          });
        }}
      />

      {selected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio
          flipEnabled={false}
          borderStroke="black"
          borderStrokeWidth={1}
          anchorStroke="black"
          anchorFill="#efefef"
          anchorSize={8}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
        />
      )}
    </>
  );
}
