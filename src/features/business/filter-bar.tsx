"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Select } from "@/components/ui/select";

type FilterOption = { value: string; label: string };

type FilterDefinition = {
  name: string;
  label: string;
  allLabel?: string;
  defaultValue?: string;
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
            <Select
              key={filter.name}
              ariaLabel={filter.label}
              value={searchParams.get(filter.name) ?? filter.defaultValue ?? ""}
              onValueChange={(value) => updateParam(filter.name, value)}
              options={[
                ...(filter.allLabel ? [{ value: "", label: filter.allLabel }] : []),
                ...filter.options,
              ]}
              className="flex-1 sm:w-48 sm:flex-none"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
