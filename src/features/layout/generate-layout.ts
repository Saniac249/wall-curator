import type { Artwork } from "@/features/artwork/artwork-types";

import type { CanvasSize, LayoutSettings } from "./layout-types";

import { clamp, randomBetween, shuffleArray } from "./layout-utils";

import { overlapsArtwork } from "./scoring";

type GenerateLayoutOptions = {
  artworks: Artwork[];
  canvas: CanvasSize;
  settings?: Partial<LayoutSettings>;
};

const DEFAULT_SETTINGS: LayoutSettings = {
  density: 0.55,
  irregularity: 0.65,
  scaleVariation: 0.1,
};

export function generateLayout({
  artworks,
  canvas,
  settings,
}: GenerateLayoutOptions): Artwork[] {
  if (artworks.length === 0 || canvas.width <= 0 || canvas.height <= 0) {
    return artworks;
  }

  const config = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  const shuffled = shuffleArray(artworks);

  const placed: Artwork[] = [];

  /*
    We don't use the entire canvas.

    The artwork should read as one
    composition living on the wall.
  */

  const compositionWidth = clamp(canvas.width * 0.68, 500, canvas.width * 0.82);

  const compositionHeight = clamp(
    canvas.height * 0.68,
    380,
    canvas.height * 0.8
  );

  const compositionX = (canvas.width - compositionWidth) / 2;

  const compositionY = (canvas.height - compositionHeight) / 2;

  /*
    Higher density means less air
    required between pieces.
  */

  const padding = 34 - config.density * 18;

  for (const original of shuffled) {
    /*
      Every piece gets some variation,
      but the range is deliberately tight.

      No hero scaling.
    */

    const scale =
      1 + randomBetween(-config.scaleVariation, config.scaleVariation);

    const width = original.baseWidth * scale;

    const height = original.baseHeight * scale;

    let result: Artwork | null = null;

    for (let attempt = 0; attempt < 500; attempt++) {
      const maxX = compositionX + compositionWidth - width;

      const maxY = compositionY + compositionHeight - height;

      const x = randomBetween(compositionX, Math.max(compositionX, maxX));

      const y = randomBetween(compositionY, Math.max(compositionY, maxY));

      const rotation = randomBetween(-2.2, 2.2) * config.irregularity;

      const candidate: Artwork = {
        ...original,

        x,
        y,

        width,
        height,

        rotation,
      };

      if (!overlapsArtwork(candidate, placed, padding)) {
        result = candidate;
        break;
      }
    }

    /*
      If we fail to find a totally
      clean position after many tries,
      place it anyway.

      We'll improve crowded-layout
      handling later.
    */

    if (!result) {
      result = {
        ...original,

        x: randomBetween(
          compositionX,
          Math.max(compositionX, compositionX + compositionWidth - width)
        ),

        y: randomBetween(
          compositionY,
          Math.max(compositionY, compositionY + compositionHeight - height)
        ),

        width,
        height,

        rotation: randomBetween(-1.5, 1.5),
      };
    }

    placed.push(result);
  }

  /*
    Preserve normal stack order instead
    of leaving it based on shuffle order.
  */

  return placed.map((artwork, index) => ({
    ...artwork,
    zIndex: index,
  }));
}
