"use client";

import Image, { type ImageProps } from "next/image";
import { useImageLoaded } from "@/hooks/use-image-loaded";
import { cn } from "@/lib/cn";

export function FadeImage({ alt, className, ...props }: ImageProps) {
  const { loaded, ref, onLoad } = useImageLoaded();

  return (
    <Image
      {...props}
      alt={alt}
      ref={ref}
      onLoad={onLoad}
      data-loaded={loaded || undefined}
      className={cn(
        "opacity-0 transition-opacity duration-500 data-loaded:opacity-100",
        className,
      )}
    />
  );
}
