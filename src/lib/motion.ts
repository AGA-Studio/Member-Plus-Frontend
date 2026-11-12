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
