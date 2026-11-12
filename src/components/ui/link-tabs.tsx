import Link from "next/link";
import { cx } from "@/lib/cx";

type LinkTab = {
  href: string;
  label: string;
  active: boolean;
};

type LinkTabsProps = {
  tabs: LinkTab[];
  label: string;
};

export function LinkTabs({ tabs, label }: LinkTabsProps) {
  return (
    <nav aria-label={label} className="overflow-x-auto border-b border-border">
      <ul className="flex min-w-max">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={cx(
                "flex h-11 items-center border-b-2 px-4 text-base transition-colors duration-150 ease-out",
                tab.active
                  ? "border-primary font-semibold text-primary-text"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
