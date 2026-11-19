"use client";

import { useEffect, useRef, useState } from "react";

type InViewOptions = {
  threshold?: number;
  rootMargin?: string;
};

export function useInView<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = "0px 0px -6% 0px",
}: InViewOptions = {}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setVisible(true));

      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      setVisible(false);
    };
  }, [threshold, rootMargin]);

  return { ref, visible };
}
