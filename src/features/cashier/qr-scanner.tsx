"use client";

import { Camera, CameraOff, Scan } from "lucide-react";
import jsQR from "jsqr";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

export type ScannerStatus = "starting" | "scanning" | "found" | "denied";

type QrScannerProps = {
  paused: boolean;
  found: boolean;
  onDetect: (code: string) => void;
  onDenied: () => void;
};

const scanIntervalMs = 120;

export function QrScanner({ paused, found, onDetect, onDenied }: QrScannerProps) {
  const t = useTranslations("cashier.scan.scanner");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDetectRef = useRef(onDetect);
  const onDeniedRef = useRef(onDenied);
  const pausedRef = useRef(paused);
  const [status, setStatus] = useState<"starting" | "scanning" | "denied">("starting");

  useEffect(() => {
    onDetectRef.current = onDetect;
    onDeniedRef.current = onDenied;
    pausedRef.current = paused;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch {
        if (!cancelled) {
          setStatus("denied");
          onDeniedRef.current();
        }
        return;
      }

      if (cancelled || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => undefined);
      setStatus("scanning");

      timer = window.setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || pausedRef.current || video.readyState < 2) return;

        const width = video.videoWidth;
        const height = video.videoHeight;
        if (!width || !height) return;

        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;

        context.drawImage(video, 0, 0, width, height);
        const image = context.getImageData(0, 0, width, height);
        const result = jsQR(image.data, width, height, { inversionAttempts: "dontInvert" });

        if (result?.data) onDetectRef.current(result.data);
      }, scanIntervalMs);
    }

    start();

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const denied = status === "denied";

  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-xl bg-ink-950 sm:h-95">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden
        className={cx(
          "absolute inset-0 size-full object-cover transition-opacity duration-150 ease-out",
          status === "scanning" ? "opacity-100" : "opacity-0",
        )}
      />
      <canvas ref={canvasRef} aria-hidden className="hidden" />

      {denied ? (
        <div className="relative flex max-w-xs flex-col items-center gap-3 px-6 text-center text-ink-100">
          <CameraOff aria-hidden strokeWidth={1.75} className="size-8" />
          <p className="font-display text-lg font-semibold text-white">{t("deniedTitle")}</p>
          <p className="text-sm">{t("deniedMessage")}</p>
        </div>
      ) : (
        <>
          <Scan
            aria-hidden
            size={224}
            absoluteStrokeWidth
            strokeWidth={4}
            className={cx(
              "relative transition-colors duration-150 ease-out",
              found ? "text-success-soft" : "text-white",
            )}
          />
          {status === "scanning" && !found ? (
            <div
              aria-hidden
              className="absolute h-0.5 w-40 animate-scan rounded-full bg-accent-400 motion-reduce:animate-none"
            />
          ) : null}
          <p
            aria-live="polite"
            className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-ink-950/70 px-4 py-2 text-sm font-medium text-white"
          >
            {found ? t("detected") : t("aim")}
          </p>
        </>
      )}

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-ink-950/70 px-3 py-2 text-sm font-medium text-white">
        {denied ? (
          <CameraOff aria-hidden strokeWidth={1.75} className="size-4" />
        ) : (
          <Camera aria-hidden strokeWidth={1.75} className="size-4" />
        )}
        {denied ? t("blocked") : t("active")}
      </div>
    </div>
  );
}
