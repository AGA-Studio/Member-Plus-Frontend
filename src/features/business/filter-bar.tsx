"use client";

import { ChevronDown, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { cx } from "@/lib/cx";

type FilterOption = { value: string; label: string };

type FilterDefinition = {
  name: string;
  label: string;
  allLabel: string;
  options: FilterOption[];
};

type FilterBarProps = {
  searchLabel: string;
  searchPlaceholder: string;
  filters?: FilterDefinition[];
};

const debounceMilliseconds = 300;

export function FilterBar({ searchLabel, searchPlaceholder, filters = [] }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const timerRef = useRef<number | undefined>(undefined);

  function updateParam(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete("page");
    const queryString = next.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => updateParam("q", value.trim()), debounceMilliseconds);
  }

  return (
    <div role="search" aria-busy={pending} className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1 sm:max-w-sm">
        <span className="sr-only">{searchLabel}</span>
        <Search
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          autoComplete="off"
          className="h-11 w-full rounded-md border border-border-strong bg-surface pl-10 pr-3 text-base text-foreground transition-[border-color] duration-150 ease-out placeholder:text-muted focus:border-primary"
        />
      </label>
      {filters.length > 0 ? (
        <div className="flex gap-3">
          {filters.map((filter) => (
            <label key={filter.name} className="relative flex-1 sm:flex-none">
              <span className="sr-only">{filter.label}</span>
              <select
                value={searchParams.get(filter.name) ?? ""}
                onChange={(event) => updateParam(filter.name, event.target.value)}
                className={cx(
                  "h-11 w-full appearance-none rounded-md border border-border-strong bg-surface pl-3 pr-10 text-base text-foreground",
                  "transition-[border-color] duration-150 ease-out focus:border-primary",
                )}
              >
                <option value="">{filter.allLabel}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                strokeWidth={1.75}
                className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted"
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
