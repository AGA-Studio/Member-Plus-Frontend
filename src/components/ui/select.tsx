"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cx } from "@/lib/cx";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  id?: string;
  ariaLabel?: string;
  labelledBy?: string;
  className?: string;
};

const optionHeight = 44;
const listPadding = 8;
const maxListHeight = 240;
const gap = 4;
const viewportMargin = 8;
const typeaheadResetMilliseconds = 600;

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  id,
  ariaLabel,
  labelledBy,
  className,
}: SelectProps) {
  const generatedId = useId();
  const triggerId = id ?? `${generatedId}-trigger`;
  const listId = `${generatedId}-list`;
  const optionId = useCallback((index: number) => `${generatedId}-option-${index}`, [generatedId]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef({ text: "", timer: 0 });
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentValue = value ?? internalValue;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === currentValue),
  );
  const selected = options[selectedIndex];

  const close = useCallback(() => setOpen(false), []);

  function openList() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;

    if (value === undefined) setInternalValue(option.value);
    if (option.value !== currentValue) onValueChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  useLayoutEffect(() => {
    const list = listRef.current;
    const trigger = triggerRef.current;
    if (!list || !trigger) return;

    if (!open) {
      if (list.matches(":popover-open")) list.hidePopover();
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const listHeight = Math.min(options.length * optionHeight + listPadding, maxListHeight);
    const spaceBelow = window.innerHeight - rect.bottom - viewportMargin;
    const opensUp = spaceBelow < listHeight && rect.top > spaceBelow;

    list.style.left = `${rect.left}px`;
    list.style.minWidth = `${rect.width}px`;
    list.style.maxWidth = `${window.innerWidth - viewportMargin * 2}px`;
    list.style.top = opensUp ? "auto" : `${rect.bottom + gap}px`;
    list.style.bottom = opensUp ? `${window.innerHeight - rect.top + gap}px` : "auto";
    list.style.maxHeight = `${Math.max(optionHeight + listPadding, Math.min(maxListHeight, opensUp ? rect.top - gap - viewportMargin : spaceBelow - gap))}px`;
    list.dataset.side = opensUp ? "top" : "bottom";

    if (!list.matches(":popover-open")) list.showPopover();

    const overflow = rect.left + list.offsetWidth - (window.innerWidth - viewportMargin);
    if (overflow > 0) list.style.left = `${Math.max(viewportMargin, rect.left - overflow)}px`;
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      close();
    }

    function handleScroll(event: Event) {
      if (event.target instanceof Node && listRef.current?.contains(event.target)) return;
      close();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, optionId]);

  function typeahead(character: string) {
    const state = typeaheadRef.current;
    window.clearTimeout(state.timer);
    state.text += character.toLowerCase();
    state.timer = window.setTimeout(() => {
      state.text = "";
    }, typeaheadResetMilliseconds);

    const start = open ? activeIndex : selectedIndex;
    const ordered = [...options.slice(start + 1), ...options.slice(0, start + 1)];
    const match = ordered.find((option) => option.label.toLowerCase().startsWith(state.text));
    if (!match) return;

    const index = options.indexOf(match);
    if (open) setActiveIndex(index);
    else choose(index);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const lastIndex = options.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        typeahead(event.key);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, lastIndex));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(lastIndex);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "Tab":
        close();
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          typeahead(event.key);
        }
    }
  }

  return (
    <div className={cx("relative", className)}>
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleKeyDown}
        onBlur={close}
        className={cx(
          "flex h-11 w-full select-none items-center justify-between gap-2 rounded-md border bg-surface pl-3 pr-3 text-left text-base text-foreground",
          "transition-[border-color,transform] duration-150 ease-out active:scale-97",
          open ? "border-primary" : "border-border-strong",
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={cx(
            "size-5 shrink-0 text-muted transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        popover="manual"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        onPointerDown={(event) => event.preventDefault()}
        className={cx(
          "fixed m-0 w-max overflow-y-auto rounded-md border border-border bg-surface p-1 text-foreground shadow-lg",
          "scale-95 opacity-0 transition-[opacity,scale,display,overlay] duration-100 ease-out transition-discrete",
          "open:scale-100 open:opacity-100 open:duration-150 starting:open:scale-95 starting:open:opacity-0",
          "data-[side=bottom]:origin-top data-[side=top]:origin-bottom",
        )}
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;

          return (
            <div
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={isSelected}
              onPointerEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
              className={cx(
                "flex h-11 cursor-pointer items-center justify-between gap-2 rounded-sm px-3 text-base transition-colors duration-100 ease-out",
                index === activeIndex ? "bg-surface-muted" : "bg-transparent",
                isSelected ? "font-medium text-primary-text" : "text-foreground",
              )}
            >
              <span className="truncate">{option.label}</span>
              {isSelected ? <Check aria-hidden strokeWidth={2} className="size-4 shrink-0" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
