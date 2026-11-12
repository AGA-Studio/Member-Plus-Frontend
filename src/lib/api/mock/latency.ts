const defaultLatencyMilliseconds = 450;

export async function simulateLatency(extraMilliseconds = 0): Promise<void> {
  const configured = process.env.MOCK_LATENCY_MS;
  const base = configured === undefined ? defaultLatencyMilliseconds : Number(configured);
  const total = (Number.isFinite(base) ? base : defaultLatencyMilliseconds) + extraMilliseconds;

  if (total <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, total));
}
