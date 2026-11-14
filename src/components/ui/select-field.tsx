import { useId } from "react";
import { Select, type SelectOption } from "./select";

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  name?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function SelectField({ label, options, name, defaultValue, onValueChange }: SelectFieldProps) {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-sm font-medium text-foreground">
        {label}
      </span>
      <Select
        name={name}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        options={options}
        labelledBy={labelId}
      />
    </div>
  );
}
