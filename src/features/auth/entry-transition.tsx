"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/components/ui/toast-provider";
import { cx } from "@/lib/cx";

type EntryTransitionValue = {
  begin: () => boolean;
  exit: () => Promise<boolean>;
};

const EntryTransitionContext = createContext<EntryTransitionValue>({
  begin: () => false,
  exit: async () => false,
});

export function useEntryTransition(): EntryTransitionValue {
  return useContext(EntryTransitionContext);
}

type Phase = "idle" | "cover" | "reveal" | "closing" | "closed";

const appRoutePrefixes = ["/caja", "/clientes", "/membresias", "/niveles", "/movimientos", "/plataforma"];
const excludedRoutes = ["/membresias/imprimir"];

function isAppRoute(pathname: string): boolean {
  if (excludedRoutes.some((route) => pathname.startsWith(route))) return false;

  return appRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const loginCoverMilliseconds = 550;
const loadCoverMilliseconds = 350;
const targetSearchMilliseconds = 1500;
const flightMilliseconds = 500;
const revealMilliseconds = 600;
const safetyMilliseconds = 6000;
const closeMilliseconds = 520;
const closeLogoMilliseconds = 460;
const closeLogoDelayMilliseconds = 120;
const closeFadeMilliseconds = 280;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function findVisibleTarget(): HTMLElement | null {
  const candidates = [...document.querySelectorAll<HTMLElement>("[data-entry-target]")];

  return candidates.find((candidate) => candidate.getBoundingClientRect().width > 0) ?? null;
}

function readEasing(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

async function findTarget(): Promise<HTMLElement | null> {
  const deadline = performance.now() + targetSearchMilliseconds;

  while (performance.now() < deadline) {
    const candidates = [...document.querySelectorAll<HTMLElement>("[data-entry-target]")];
    const visible = candidates.find((candidate) => candidate.getBoundingClientRect().width > 0);
    if (visible) return visible;
    if (candidates.length > 0) return null;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return null;
}

type EntryTransitionProviderProps = {
  playOnLoad: boolean;
  children: ReactNode;
};

export function EntryTransitionProvider({ playOnLoad, children }: EntryTransitionProviderProps) {
  const pathname = usePathname();
  const { show } = useToast();
  const toasts = useTranslations("toasts");
  const [loadsWithIntro] = useState(() => playOnLoad && isAppRoute(pathname));
  const [phase, setPhase] = useState<Phase>(loadsWithIntro ? "cover" : "idle");
  const [instantCover, setInstantCover] = useState(loadsWithIntro);
  const appRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const exitAnimations = useRef<Animation[]>([]);
  const exitStartPath = useRef("");
  const startedAt = useRef(0);
  const startPath = useRef(pathname);
  const playing = useRef(false);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;

    return () => {
      unmounted.current = true;
    };
  }, []);

  const play = useCallback(
    async (coverMilliseconds: number, announce: boolean) => {
      if (playing.current) return;
      playing.current = true;

      const animations: Animation[] = [];
      const finish = () => {
        animations.forEach((animation) => animation.cancel());
        playing.current = false;
        window.clearTimeout(safety);
        setPhase("idle");
        setInstantCover(false);
      };
      const safety = window.setTimeout(finish, safetyMilliseconds);

      try {
        await wait(Math.max(0, coverMilliseconds - (performance.now() - startedAt.current)));
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const target = reducedMotion ? null : await findTarget();
        const app = appRef.current;
        const logo = logoRef.current;
        if (unmounted.current || !app || !logo || reducedMotion) return finish();

        const easeInOut = readEasing("--ease-in-out", "ease-in-out");
        const easeOut = readEasing("--ease-out", "ease-out");
        const logoRect = logo.getBoundingClientRect();
        const logoX = logoRect.left + logoRect.width / 2;
        const logoY = logoRect.top + logoRect.height / 2;
        const isLogoTarget = target?.dataset.entryTarget === "logo";
        const targetRect = target?.getBoundingClientRect();
        const originX = targetRect ? targetRect.left + targetRect.width / 2 : logoX;
        const originY = targetRect ? targetRect.top + targetRect.height / 2 : logoY;

        const flight = logo.animate(
          [
            { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
            isLogoTarget && targetRect
              ? {
                  transform: `translate(${originX - logoX}px, ${originY - logoY}px) scale(${targetRect.width / logoRect.width})`,
                  opacity: 1,
                }
              : {
                  transform: `translate(${originX - logoX}px, ${originY - logoY}px) scale(0.3)`,
                  opacity: 0,
                },
          ],
          { duration: flightMilliseconds, easing: easeInOut, fill: "forwards" },
        );
        animations.push(flight);
        await flight.finished;
        if (unmounted.current) return finish();

        const radius = Math.hypot(
          Math.max(originX, window.innerWidth - originX),
          Math.max(originY, window.innerHeight - originY),
        );
        const reveal = app.animate(
          [
            { clipPath: `circle(0px at ${originX}px ${originY}px)` },
            { clipPath: `circle(${radius}px at ${originX}px ${originY}px)` },
          ],
          { duration: revealMilliseconds, easing: easeOut, fill: "both" },
        );
        animations.push(reveal);
        flushSync(() => setPhase("reveal"));
        await reveal.finished;
        finish();
        if (announce) show("success", toasts("signedIn"));
      } catch {
        finish();
      }
    },
    [show, toasts],
  );

  const begin = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

    startedAt.current = performance.now();
    startPath.current = pathname;
    setInstantCover(false);
    setPhase("cover");

    return true;
  }, [pathname]);

  const closeApp = useCallback(async (): Promise<boolean> => {
    if (playing.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const app = appRef.current;
    if (!app) return false;

    playing.current = true;
    exitStartPath.current = pathname;
    const target = findVisibleTarget();
    const targetRect = target?.getBoundingClientRect();
    const originX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth / 2;
    const originY = targetRect ? targetRect.top + targetRect.height / 2 : window.innerHeight / 2;
    const isLogoTarget = target?.dataset.entryTarget === "logo";
    const easeInOut = readEasing("--ease-in-out", "ease-in-out");

    setInstantCover(true);
    flushSync(() => setPhase("closing"));
    const logo = logoRef.current;
    if (!logo) {
      playing.current = false;
      setPhase("idle");
      return false;
    }

    const logoRect = logo.getBoundingClientRect();
    const logoX = logoRect.left + logoRect.width / 2;
    const logoY = logoRect.top + logoRect.height / 2;
    const atTarget =
      isLogoTarget && targetRect
        ? {
            transform: `translate(${originX - logoX}px, ${originY - logoY}px) scale(${targetRect.width / logoRect.width})`,
            opacity: 1,
          }
        : { transform: `translate(${originX - logoX}px, ${originY - logoY}px) scale(0.3)`, opacity: 0 };
    const atCenter = { transform: "translate(0px, 0px) scale(1)", opacity: 1 };

    const radius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );
    const contract = app.animate(
      [
        { clipPath: `circle(${radius}px at ${originX}px ${originY}px)` },
        { clipPath: `circle(0px at ${originX}px ${originY}px)` },
      ],
      { duration: closeMilliseconds, easing: easeInOut, fill: "both" },
    );
    const fly = logo.animate([atTarget, atCenter], {
      duration: closeLogoMilliseconds,
      delay: closeLogoDelayMilliseconds,
      easing: easeInOut,
      fill: "both",
    });
    exitAnimations.current = [contract, fly];

    try {
      await Promise.all([contract.finished, fly.finished]);
    } catch {
      return true;
    }
    flushSync(() => setPhase("closed"));

    return true;
  }, [pathname]);

  useEffect(() => {
    if (phase !== "closed" || pathname === exitStartPath.current) return;

    let cancelled = false;

    async function reveal() {
      await wait(120);
      const overlay = overlayRef.current;
      if (cancelled || !overlay) return;

      const app = appRef.current;
      app?.getAnimations().forEach((animation) => animation.cancel());
      const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: closeFadeMilliseconds,
        easing: readEasing("--ease-out", "ease-out"),
        fill: "forwards",
      });
      exitAnimations.current.push(fade);
      await fade.finished;
    }

    reveal()
      .catch(() => undefined)
      .finally(() => {
        exitAnimations.current.forEach((animation) => animation.cancel());
        exitAnimations.current = [];
        playing.current = false;
        setInstantCover(false);
        setPhase("idle");
      });

    return () => {
      cancelled = true;
    };
  }, [phase, pathname]);

  useEffect(() => {
    if (phase !== "closing" && phase !== "closed") return;

    const safety = window.setTimeout(() => {
      appRef.current?.getAnimations().forEach((animation) => animation.cancel());
      exitAnimations.current.forEach((animation) => animation.cancel());
      exitAnimations.current = [];
      playing.current = false;
      setInstantCover(false);
      setPhase("idle");
    }, safetyMilliseconds);

    return () => window.clearTimeout(safety);
  }, [phase]);

  useEffect(() => {
    if (!loadsWithIntro) return;

    startedAt.current = performance.now();
    void play(loadCoverMilliseconds, false);
  }, [loadsWithIntro, play]);

  useEffect(() => {
    if (phase !== "cover" || instantCover || pathname === startPath.current) return;

    void play(loginCoverMilliseconds, true);
  }, [phase, instantCover, pathname, play]);

  const value = useMemo(() => ({ begin, exit: closeApp }), [begin, closeApp]);

  return (
    <EntryTransitionContext.Provider value={value}>
      <div ref={appRef} className="relative z-10 flex flex-1 flex-col">
        {children}
      </div>
      {phase !== "idle" ? (
        <div
          ref={overlayRef}
          aria-hidden
          className={cx(
            "fixed inset-0 flex items-center justify-center bg-brand",
            !instantCover && "transition-opacity duration-200 ease-out starting:opacity-0",
            phase === "cover" || phase === "closed" ? "z-50" : "z-0",
          )}
        >
          <div
            ref={logoRef}
            className={cx(!instantCover && "transition-[opacity,scale] duration-300 ease-out starting:scale-90 starting:opacity-0")}
          >
            <Logo surface="dark" className="h-16 w-auto" />
          </div>
        </div>
      ) : null}
    </EntryTransitionContext.Provider>
  );
}
