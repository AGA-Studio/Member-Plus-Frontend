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
