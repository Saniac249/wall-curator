"use client";

import dynamic from "next/dynamic";

import { ChangeEvent, useCallback, useState } from "react";

import type {
  Artwork,
  ArtworkOrientation,
} from "@/features/artwork/artwork-types";

import { generateLayout } from "@/features/layout/generate-layout";

const WallCanvas = dynamic(() => import("./WallCanvas"), {
  ssr: false,
});

function getOrientation(width: number, height: number): ArtworkOrientation {
  const ratio = width / height;

  if (ratio > 0.95 && ratio < 1.05) {
    return "square";
  }

  return ratio > 1 ? "landscape" : "portrait";
}

function getInitialSize(aspectRatio: number) {
  /*
    Give every piece approximately the
    same starting visual area.

    This prevents portrait/landscape
    orientation from accidentally deciding
    which image feels more important.
  */

  const targetArea = 26000;

  const width = Math.sqrt(targetArea * aspectRatio);

  const height = width / aspectRatio;

  return {
    width,
    height,
  };
}

function loadArtwork(file: File, index: number): Promise<Artwork> {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);

    const image = new window.Image();

    image.onload = () => {
      const aspectRatio = image.width / image.height;

      const initialSize = getInitialSize(aspectRatio);

      resolve({
        id: crypto.randomUUID(),

        src,
        fileName: file.name,

        naturalWidth: image.width,

        naturalHeight: image.height,

        aspectRatio,

        orientation: getOrientation(image.width, image.height),

        /*
            Stable layout reference size.

            Reshuffle always works from these
            dimensions rather than repeatedly
            scaling the current dimensions.
          */

        baseWidth: initialSize.width,

        baseHeight: initialSize.height,

        /*
            Current rendered dimensions.
          */

        width: initialSize.width,

        height: initialSize.height,

        /*
            generateLayout() will immediately
            replace these.
          */

        x: 0,
        y: 0,

        rotation: 0,

        zIndex: index,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(src);

      reject(new Error(`Could not load ${file.name}`));
    };

    image.src = src;
  });
}

export default function Editor() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const handleCanvasSize = useCallback(
    (size: { width: number; height: number }) => {
      setCanvasSize(size);
    },
    []
  );

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    /*
      Reset the input immediately so the
      same files can be selected again later.
    */

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    if (canvasSize.width <= 0 || canvasSize.height <= 0) {
      return;
    }

    try {
      /*
        Wait until the entire selected batch
        has loaded before changing state.

        This prevents the wall from recomposing
        once per individual image.
      */

      const newArtworks = await Promise.all(
        files.map((file, index) => loadArtwork(file, index))
      );

      setArtworks((current) => {
        const combined = [...current, ...newArtworks].map((artwork, index) => ({
          ...artwork,
          zIndex: index,
        }));

        /*
            Fresh uploads immediately receive
            a curated layout.

            No temporary diagonal stack.
          */

        return generateLayout({
          artworks: combined,

          canvas: canvasSize,
        });
      });

      setSelectedId(null);
    } catch (error) {
      console.error("Artwork upload failed:", error);
    }
  }

  function updateArtwork(id: string, updates: Partial<Artwork>) {
    setArtworks((current) =>
      current.map((artwork) =>
        artwork.id === id
          ? {
              ...artwork,
              ...updates,
            }
          : artwork
      )
    );
  }

  function handleReshuffle() {
    if (
      artworks.length < 2 ||
      canvasSize.width <= 0 ||
      canvasSize.height <= 0
    ) {
      return;
    }

    setArtworks((current) =>
      generateLayout({
        artworks: current,

        canvas: canvasSize,
      })
    );

    setSelectedId(null);
  }

  return (
    <main
      className="
        flex
        h-screen
        flex-col
        overflow-hidden
        bg-[#efefef]
        text-[#111]
      "
    >
      <header
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-black/15
          px-6
        "
      >
        <span
          className="
            text-sm
            font-medium
            tracking-tight
          "
        >
          WALL 01
        </span>

        <span
          className="
            text-xs
            tracking-wide
            text-black/45
          "
        >
          10 FT × 8 FT
        </span>
      </header>

      <div
        className="
          flex
          h-14
          shrink-0
          items-center
          justify-between
          border-b
          border-black/10
          px-6
        "
      >
        <label
          className="
            cursor-pointer
            text-xs
            uppercase
            tracking-[0.14em]
            transition-opacity
            hover:opacity-50
          "
        >
          Add artwork
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        <div
          className="
            flex
            items-center
            gap-8
          "
        >
          <span
            className="
              text-xs
              text-black/40
            "
          >
            {artworks.length} {artworks.length === 1 ? "piece" : "pieces"}
          </span>

          {artworks.length > 1 && (
            <button
              type="button"
              onClick={handleReshuffle}
              className="
                cursor-pointer
                text-xs
                uppercase
                tracking-[0.14em]
                transition-opacity
                hover:opacity-50
              "
            >
              Reshuffle ↻
            </button>
          )}
        </div>
      </div>

      <section
        className="
          min-h-0
          flex-1
        "
      >
        <WallCanvas
          artworks={artworks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onArtworkChange={updateArtwork}
          onSizeChange={handleCanvasSize}
        />
      </section>
    </main>
  );
}
