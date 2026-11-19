const revealBase =
  "transition-[opacity,translate] duration-250 ease-out starting:translate-y-2 starting:opacity-0";

const revealDelays = [
  "delay-0",
  "delay-40",
  "delay-80",
  "delay-120",
  "delay-160",
  "delay-200",
] as const;

export function revealClasses(index = 0): string {
  const delay = revealDelays[Math.min(index, revealDelays.length - 1)];

  return `${revealBase} ${delay}`;
}

const entranceBase =
  "transition-[opacity,translate,scale,filter] duration-500 ease-out starting:translate-y-3 starting:scale-98 starting:opacity-0 starting:blur-xs";

const entranceDelays = [
  "delay-0",
  "delay-80",
  "delay-160",
  "delay-240",
  "delay-320",
  "delay-400",
  "delay-480",
  "delay-560",
] as const;

export function entranceClasses(index = 0): string {
  const delay = entranceDelays[Math.min(index, entranceDelays.length - 1)];

  return `${entranceBase} ${delay}`;
}

const viewBase = "transition-[opacity,translate,scale,filter] duration-500 ease-out";

const viewHidden = "translate-y-3 scale-98 opacity-0 blur-xs";

const viewDelays = [
  "sm:delay-0",
  "sm:delay-80",
  "sm:delay-160",
  "sm:delay-240",
  "sm:delay-320",
  "sm:delay-400",
] as const;

export function viewClasses(index: number, visible: boolean): string {
  const delay = viewDelays[Math.min(index, viewDelays.length - 1)];

  return `${viewBase} ${delay}${visible ? "" : ` ${viewHidden}`}`;
}

const staggerBase =
  "transition-[opacity,translate,scale,filter] duration-300 ease-out starting:translate-y-2 starting:scale-98 starting:opacity-0 starting:blur-xs";

const staggerDelays = [
  "delay-60",
  "delay-100",
  "delay-140",
  "delay-180",
  "delay-220",
  "delay-260",
  "delay-300",
  "delay-340",
  "delay-380",
  "delay-420",
  "delay-460",
  "delay-500",
] as const;

export function staggerClasses(index: number): string {
  const delay = staggerDelays[Math.min(Math.max(index, 0), staggerDelays.length - 1)];

  return `${staggerBase} ${delay}`;
}
