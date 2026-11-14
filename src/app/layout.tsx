import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import { FlashToast } from "@/components/ui/flash-toast";
import { EntryTransitionProvider } from "@/features/auth/entry-transition";
import { ToastProvider } from "@/components/ui/toast-provider";
import { getLocale, getTranslations } from "next-intl/server";
import { sessionCookieName } from "@/lib/session-cookie";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const hasSession = (await cookies()).has(sessionCookieName);
  const cacheControl = (await headers()).get("cache-control") ?? "";
  const isReload = /max-age=0|no-cache/.test(cacheControl);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <ToastProvider>
            <EntryTransitionProvider playOnLoad={hasSession && !isReload}>{children}</EntryTransitionProvider>
            <Suspense fallback={null}>
              <FlashToast />
            </Suspense>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
