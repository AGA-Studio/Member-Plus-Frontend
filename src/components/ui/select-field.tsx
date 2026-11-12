import { ChevronDown } from "lucide-react";
import { useId, type SelectHTMLAttributes } from "react";

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label: string;
  options: { value: string; label: string }[];
};

export function SelectField({ label, options, ...rest }: SelectFieldProps) {
  const selectId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className="h-11 w-full appearance-none rounded-md border border-border-strong bg-surface pl-3 pr-10 text-base text-foreground transition-[border-color] duration-150 ease-out focus:border-primary"
          {...rest}
        >
          {options.map((option) => (
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
      </div>
    </div>
  );
}
