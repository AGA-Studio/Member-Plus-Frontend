"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { lookupCardAction } from "./actions";
import { QrScanner } from "./qr-scanner";

type ScanCardProps = {
  onFound: () => void;
};

export function ScanCard({ onFound }: ScanCardProps) {
  const t = useTranslations("cashier.scan");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorKey, setErrorKey] = useState<"empty" | "notFound" | null>(null);
  const [detected, setDetected] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const lookingUpRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) inputRef.current?.focus();
  }, []);

  function lookUp(rawCode: string, fromScanner: boolean) {
    if (lookingUpRef.current) return;
    lookingUpRef.current = true;
    setErrorKey(null);
    if (fromScanner) {
      setDetected(true);
      setCode(rawCode);
    }

    startTransition(async () => {
      const result = await lookupCardAction(rawCode);
      lookingUpRef.current = false;
      setDetected(false);

      if (result.ok) {
        router.replace(`/caja?code=${encodeURIComponent(result.code)}`);
        onFound();
        return;
      }

      setErrorKey(result.reason);
      if (!fromScanner) inputRef.current?.focus();
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    lookUp(code, false);
  }

  function focusCodeField() {
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <QrScanner
        paused={pending}
        found={detected}
        onDetect={(value) => lookUp(value, true)}
        onDenied={focusCodeField}
      />
      <div className="flex items-center gap-4" role="separator">
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted">{t("orType")}</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <TextField
            ref={inputRef}
            name="code"
            label={t("codeLabel")}
            placeholder={t("codePlaceholder")}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            error={errorKey ? t(`errors.${errorKey}`) : undefined}
          />
        </div>
        <Button
          type="submit"
          size="md"
          loading={pending}
          className="sm:mt-7 sm:w-auto"
          fullWidth
        >
          {pending ? t("searching") : t("search")}
        </Button>
      </form>
    </div>
  );
}
