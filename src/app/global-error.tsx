"use client";

import { TriangleAlert } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import { Button } from "@/components/ui/button";
import { SystemMessage } from "@/components/ui/system-message";
import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

type GlobalErrorProps = {
  retry: () => void;
};

export default function GlobalError({ retry }: GlobalErrorProps) {
  const prefersEnglish =
    typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en");
  const messages = prefersEnglish ? enMessages : esMessages;
  const locale = prefersEnglish ? "en-US" : "es-MX";

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SystemMessage
            icon={TriangleAlert}
            tone="warning"
            title={messages.system.error.title}
            description={messages.system.error.description}
          >
            <Button onClick={() => retry()}>{messages.system.error.retry}</Button>
          </SystemMessage>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
