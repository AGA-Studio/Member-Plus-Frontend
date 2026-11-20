"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type CameraCaptureDialogProps = {
  onClose: () => void;
  onCapture: (file: File) => void;
};

export function CameraCaptureDialog({ onClose, onCapture }: CameraCaptureDialogProps) {
  const t = useTranslations("common.photoField");
  const common = useTranslations("common");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function start() {
      const media = navigator.mediaDevices;
      if (!media?.getUserMedia) {
        setError(true);
        return;
      }

      try {
        stream = await media.getUserMedia({ video: { facingMode: "user" }, audio: false });
      } catch {
        if (!cancelled) setError(true);
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      if (!cancelled) setReady(true);
    }

    void start();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    // La vista es cuadrada y en espejo (object-cover + scale-x-100), así que se
    // recorta el cuadrado central y se voltea igual para que la foto guardada
    // sea lo que se vio en pantalla.
    const size = Math.min(video.videoWidth, video.videoHeight);
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) {
      setError(true);
      return;
    }

    context.translate(size, 0);
    context.scale(-1, 1);
    context.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) {
      setError(true);
      return;
    }

    onCapture(new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" }));
  }

  return (
    <Dialog open onClose={onClose} title={t("cameraTitle")} variant="wide">
      {error ? (
        <p className="text-base text-muted">{t("cameraError")}</p>
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          className="mx-auto aspect-square w-full max-w-md -scale-x-100 rounded-md bg-ink-950 object-cover"
        />
      )}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          {common("cancel")}
        </Button>
        <Button onClick={() => void shoot()} disabled={!ready || error}>
          {t("cameraShot")}
        </Button>
      </div>
    </Dialog>
  );
}
