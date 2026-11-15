"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SelectedImage = { file: File | null; previewUrl: string | null };

export function useSelectedImage() {
  const [selected, setSelected] = useState<SelectedImage>({ file: null, previewUrl: null });
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const select = useCallback((file: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = file ? URL.createObjectURL(file) : null;
    setSelected({ file, previewUrl: previewUrlRef.current });
  }, []);

  return { file: selected.file, previewUrl: selected.previewUrl, select };
}
