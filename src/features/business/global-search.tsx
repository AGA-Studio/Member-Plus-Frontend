"use client";

import {
  ArrowLeftRight,
  CornerDownRight,
  CreditCard,
  Layers,
  Search,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/format";
import {
  flattenResults,
  highlightParts,
  searchEntries,
  searchGroups,
  tokenize,
  type SearchEntry,
  type SearchGroup,
  type SearchResult,
  type SearchResults,
} from "@/lib/search";
import { businessNavItems } from "./nav-items";
import { buildSearchEntries, type SearchLabels } from "./search-index";
import { loadSearchSourceAction, type SearchSource } from "./search-actions";

type LoadState = "idle" | "loading" | "ready" | "error";

const shortcutHint = "⌘K";
const staleMilliseconds = 60_000;
const debounceMilliseconds = 120;
const exitMilliseconds = 150;

let cachedSource: { source: SearchSource; loadedAt: number } | null = null;
let pendingLoad: Promise<SearchSource | null> | null = null;

function loadSource(): Promise<SearchSource | null> {
  pendingLoad ??= loadSearchSourceAction()
    .then((source) => {
      if (source) cachedSource = { source, loadedAt: Date.now() };
      return source;
    })
    .catch(() => null)
    .finally(() => {
      pendingLoad = null;
    });

  return pendingLoad;
}

const groupIcons: Record<Exclude<SearchGroup, "pages">, LucideIcon> = {
  customers: Users,
  memberships: CreditCard,
  users: UserCog,
  levels: Layers,
  movements: ArrowLeftRight,
};

const pageIcons = new Map<string, LucideIcon>(businessNavItems.map((item) => [item.href, item.icon]));

function iconFor(entry: SearchEntry): LucideIcon {
  if (entry.group === "pages") return pageIcons.get(entry.href) ?? CornerDownRight;

  return groupIcons[entry.group];
}

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {highlightParts(text, tokens).map((part, index) =>
        part.match ? (
          <strong key={index} className="font-bold text-foreground">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function GlobalSearch() {
  const t = useTranslations("business.topbar.search");
  const nav = useTranslations("business.nav");
  const statuses = useTranslations("memberStatus");
  const roles = useTranslations("business.users.roles");
  const movements = useTranslations("business.movements");
  const format = useFormatter();
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [source, setSource] = useState<SearchSource | null>(cachedSource?.source ?? null);
  const [loadState, setLoadState] = useState<LoadState>(cachedSource ? "ready" : "idle");
  const [results, setResults] = useState<SearchResults>({});
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const labels = useMemo<SearchLabels>(
    () => ({
      pages: businessNavItems.map((item) => ({ href: item.href, label: nav(item.key) })),
      pageHint: t("page"),
      status: {
        active: statuses("active"),
        expiring: statuses("expiring"),
        expired: statuses("expired"),
        cancelled: statuses("cancelled"),
      },
      roles: { admin: roles("admin"), employee: roles("employee") },
      noConcept: movements("noConcept"),
      validUntil: (date) =>
        t("validUntil", { date: format.dateTime(new Date(date), { day: "numeric", month: "short", year: "numeric" }) }),
      customersCount: (count) => t("customersCount", { count }),
      amount: (cents) => formatMoney(format, cents),
      date: (iso) => format.dateTime(new Date(iso), { day: "numeric", month: "short" }),
      inactive: t("inactive"),
    }),
    [format, movements, nav, roles, statuses, t],
  );

  const entries = useMemo(() => buildSearchEntries(source, labels), [source, labels]);
  const tokens = useMemo(() => tokenize(query), [query]);
  const hasQuery = tokens.length > 0;

  const suggestions = useMemo<SearchResult[]>(
    () => entries.filter((entry) => entry.group === "pages").map((entry) => ({ ...entry, score: 0 })),
    [entries],
  );
  const flat = useMemo(() => (hasQuery ? flattenResults(results) : suggestions), [hasQuery, results, suggestions]);

  const ensureSource = useCallback(async (force = false) => {
    const fresh = cachedSource && Date.now() - cachedSource.loadedAt < staleMilliseconds;
    if (fresh && !force) {
      setSource(cachedSource!.source);
      setLoadState("ready");
      return;
    }

    setLoadState((current) => (cachedSource && !force ? current : "loading"));
    const loaded = await loadSource();

    if (loaded) {
      setSource(loaded);
      setLoadState("ready");
    } else if (!cachedSource) {
      setLoadState("error");
    }
  }, []);

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) return;

    const timer = window.setTimeout(() => setMounted(false), exitMilliseconds);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!hasQuery) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      const found = await searchEntries(entries, query, { signal: controller.signal });
      if (!found) return;
      setResults(found);
      setActiveIndex(0);
      setSearching(false);
    }, debounceMilliseconds);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [entries, hasQuery, query]);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function openPanel() {
    setOpen(true);
    void ensureSource();
  }

  function closePanel() {
    setOpen(false);
  }

  function clear() {
    setQuery("");
    setResults({});
    setSearching(false);
    inputRef.current?.focus();
  }

  function go(href: string) {
    closePanel();
    setQuery("");
    setResults({});
    inputRef.current?.blur();
    router.push(href);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (query) clear();
      else {
        closePanel();
        inputRef.current?.blur();
      }
      return;
    }

    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      openPanel();
      return;
    }

    if (flat.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + flat.length) % flat.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = flat[Math.min(activeIndex, flat.length - 1)];
      if (target) go(target.href);
    }
  }

  const activeId = flat[activeIndex] ? `${listId}-${flat[activeIndex].id}` : undefined;
  const showResults = hasQuery && loadState === "ready" && !searching;
  const noResults = showResults && flat.length === 0;
  const busy = loadState === "loading" || (hasQuery && searching);

  const positions = new Map(flat.map((result, index) => [result.id, index]));

  function renderRow(result: SearchResult, highlight: boolean) {
    const position = positions.get(result.id) ?? 0;
    const Icon = iconFor(result);
    const active = position === activeIndex;
    const activeTokens = highlight ? tokens : [];

    return (
      <Link
        key={result.id}
        id={`${listId}-${result.id}`}
        role="option"
        aria-selected={active}
        href={result.href}
        onClick={(event) => {
          event.preventDefault();
          go(result.href);
        }}
        onMouseMove={() => setActiveIndex(position)}
        className={cx(
          "flex items-center gap-3 rounded-md px-3 py-2 transition-[background-color,transform] duration-100 ease-out active:scale-99",
          active ? "bg-surface-muted" : "bg-transparent",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-text">
          <Icon aria-hidden strokeWidth={1.75} className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base text-foreground">
            <Highlight text={result.title} tokens={activeTokens} />
          </span>
          <span className="truncate text-sm text-muted">
            <Highlight text={result.subtitle} tokens={activeTokens} />
          </span>
        </span>
      </Link>
    );
  }

  return (
    <div
      ref={containerRef}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) closePanel();
      }}
      className="static min-w-0 flex-1 sm:relative sm:max-w-xl"
    >
      <div className="relative">
        <Search
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? activeId : undefined}
          aria-autocomplete="list"
          aria-label={t("label")}
          placeholder={t("placeholder")}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onFocus={openPanel}
          onClick={openPanel}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            void ensureSource();
          }}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-lg border border-transparent bg-surface-muted pl-11 pr-20 text-base text-foreground transition-[background-color,border-color] duration-150 ease-out placeholder:text-muted hover:border-border focus:border-primary focus:bg-surface focus:outline-none"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {busy ? <Spinner className="size-4 text-muted" /> : null}
          {query ? (
            <button
              type="button"
              onClick={clear}
              aria-label={t("clear")}
              className="flex size-8 items-center justify-center rounded-md text-muted transition-[background-color,color,transform] duration-150 ease-out hover:bg-border hover:text-foreground active:scale-97"
            >
              <X aria-hidden strokeWidth={1.75} className="size-4" />
            </button>
          ) : (
            <kbd className="hidden rounded-xs border border-border bg-surface px-1.5 py-0.5 text-xs font-medium text-muted lg:inline">
              {shortcutHint}
            </kbd>
          )}
        </div>
      </div>

      {mounted ? (
        <div
          tabIndex={-1}
          className={cx(
            "absolute inset-x-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-xl border border-border bg-surface shadow-lg sm:left-0 sm:right-auto sm:w-full",
            "transition-[opacity,scale] duration-150 ease-out starting:scale-95 starting:opacity-0",
            open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
          )}
        >
          <div id={listId} role="listbox" aria-label={t("label")} className="max-h-96 overflow-y-auto p-2">
            {loadState === "error" ? (
              <div className="flex flex-col items-start gap-2 px-3 py-4">
                <p className="text-base text-foreground">{t("error")}</p>
                <button
                  type="button"
                  onClick={() => void ensureSource(true)}
                  className="text-sm font-semibold text-primary-text transition-transform duration-150 ease-out active:scale-97"
                >
                  {t("retry")}
                </button>
              </div>
            ) : null}

            {loadState === "loading" && !source ? (
              <p className="px-3 py-4 text-base text-muted">{t("loading")}</p>
            ) : null}

            {loadState === "ready" && !hasQuery ? (
              <div className="flex flex-col gap-1">
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted">{t("suggestions")}</p>
                {suggestions.map((result) => renderRow(result, false))}
              </div>
            ) : null}

            {showResults && !noResults
              ? searchGroups.map((group) => {
                  const items = results[group];
                  if (!items?.length) return null;

                  return (
                    <div key={group} role="group" aria-label={t(`groups.${group}`)} className="flex flex-col gap-1 pb-2">
                      <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted">{t(`groups.${group}`)}</p>
                      {items.map((result) => renderRow(result, true))}
                    </div>
                  );
                })
              : null}

            {noResults ? (
              <div className="flex flex-col gap-1 px-3 py-6 text-center">
                <p className="text-base font-medium text-foreground">{t("empty", { query: query.trim() })}</p>
                <p className="text-sm text-muted">{t("emptyHint")}</p>
              </div>
            ) : null}
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {showResults ? t("count", { count: flat.length }) : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
