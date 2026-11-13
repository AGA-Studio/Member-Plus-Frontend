import { useId } from "react";
import { Select, type SelectOption } from "./select";

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  name?: string;
  defaultValue?: string;
};

export function SelectField({ label, options, name, defaultValue }: SelectFieldProps) {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-sm font-medium text-foreground">
        {label}
      </span>
      <Select name={name} defaultValue={defaultValue} options={options} labelledBy={labelId} />
    </div>
  );
}
