"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { shrinkImage } from "@/lib/shrink-image";
import { useSelectedImage } from "@/lib/use-selected-image";

type PhotoFieldProps = {
  name: string;
  label: string;
  optional?: boolean;
};

export function PhotoField({ name, label, optional = false }: PhotoFieldProps) {
  const t = useTranslations("common.photoField");
  const common = useTranslations("common");
  const labelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const { file, previewUrl: preview, select: setFile } = useSelectedImage();
  const [preparing, setPreparing] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const attach = useCallback((next: File | null) => {
    const input = inputRef.current;
    if (!input) return;

    const transfer = new DataTransfer();
    if (next) transfer.items.add(next);
    input.files = transfer.files;
  }, []);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;

    function restoreAfterReset() {
      window.setTimeout(() => attach(fileRef.current), 0);
    }

    form.addEventListener("reset", restoreAfterReset);

    return () => form.removeEventListener("reset", restoreAfterReset);
  }, [attach]);

  async function handleChange(selected: File | undefined) {
    if (!selected) return;

    setInvalid(false);
    setPreparing(true);
    const prepared = await shrinkImage(selected);
    setPreparing(false);

    if (!prepared) {
      fileRef.current = null;
      attach(null);
      setFile(null);
      setInvalid(true);
      return;
    }

    fileRef.current = prepared;
    attach(prepared);
    setFile(prepared);
  }

  function clear() {
    fileRef.current = null;
    attach(null);
    setFile(null);
    setInvalid(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-sm font-medium text-foreground">
        {label}
        {optional ? <span className="font-normal text-muted"> {common("optional")}</span> : null}
      </span>
      <div className="flex items-center gap-4 rounded-md border border-border p-4">
        <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary-text">
          {preview ? (
            <Image
              src={preview}
              alt=""
              fill
              unoptimized
              sizes="64px"
              className="object-cover transition-opacity duration-200 ease-out starting:opacity-0"
            />
          ) : (
            <Camera aria-hidden strokeWidth={1.75} className="size-6" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-labelledby={labelId}
            onChange={(event) => void handleChange(event.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" loading={preparing} onClick={() => inputRef.current?.click()}>
              {preparing ? t("preparing") : file ? t("change") : t("choose")}
            </Button>
            {file ? (
              <Button variant="ghost" size="sm" onClick={clear}>
                {t("remove")}
              </Button>
            ) : null}
          </div>
          <span className={invalid ? "text-sm text-danger-text" : "truncate text-sm text-muted"}>
            {invalid ? t("invalid") : (file?.name ?? t("hint"))}
          </span>
        </div>
      </div>
    </div>
  );
}
