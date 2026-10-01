import type { Artwork } from "@/features/artwork/artwork-types";

export function overlapsArtwork(
  candidate: Artwork,
  placed: Artwork[],
  padding = 20
) {
  return placed.some((other) => {
    return !(
      candidate.x + candidate.width + padding <= other.x ||
      other.x + other.width + padding <= candidate.x ||
      candidate.y + candidate.height + padding <= other.y ||
      other.y + other.height + padding <= candidate.y
    );
  });
}
