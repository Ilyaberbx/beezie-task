"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/** next/image that resolves out of its placeholder instead of popping in. */
export function FadeImage({ alt, className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      // Cache hits can finish decoding before hydration, so onLoad never fires.
      ref={(node) => {
        if (node?.complete) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      data-loaded={loaded || undefined}
      className={cn(
        "opacity-0 transition-opacity duration-500 data-loaded:opacity-100",
        className,
      )}
    />
  );
}
