"use client";

import { RefObject, useEffect, useState } from "react";

type CanvasSize = {
  width: number;
  height: number;
};

export function useCanvasSize(
  containerRef: RefObject<HTMLDivElement | null>
): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const updateSize = () => {
      setSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  return size;
}
