export type ArtworkOrientation = "portrait" | "landscape" | "square";

export type Artwork = {
  id: string;
  src: string;
  fileName: string;

  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
  orientation: ArtworkOrientation;

  // Stable reference size used by the layout generator
  baseWidth: number;
  baseHeight: number;

  // Current canvas position
  x: number;
  y: number;

  // Current rendered size
  width: number;
  height: number;

  rotation: number;
  zIndex: number;
};
