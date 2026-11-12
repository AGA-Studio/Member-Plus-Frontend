import type { FormattingLocale } from "@/i18n/config";
import type messages from "../messages/es.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: FormattingLocale;
    Messages: typeof messages;
  }
}
