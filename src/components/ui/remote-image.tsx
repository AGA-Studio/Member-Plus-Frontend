"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type RemoteImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  fallback: ReactNode;
};

export function RemoteImage({ src, alt, sizes, className, fallback }: RemoteImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image && image.complete && image.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  if (failedSrc === src) return <>{fallback}</>;

  return (
    <Image
      ref={imageRef}
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
