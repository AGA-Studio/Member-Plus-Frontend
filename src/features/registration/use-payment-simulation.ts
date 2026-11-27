import { useEffect, useRef, useState } from "react";

const paymentSteps = ["verifying", "charging", "activating"] as const;
const stepMilliseconds = 1500;
const approvedMilliseconds = 1800;

export type PaymentStage = (typeof paymentSteps)[number] | "approved";

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function usePaymentSimulation() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<PaymentStage>(paymentSteps[0]);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!open || stage === "approved") return;

    const nextStep = paymentSteps[paymentSteps.indexOf(stage) + 1];
    if (!nextStep) return;

    const timeout = window.setTimeout(() => setStage(nextStep), stepMilliseconds);

    return () => window.clearTimeout(timeout);
  }, [open, stage]);

  function start() {
    startedAt.current = performance.now();
    setStage(paymentSteps[0]);
    setOpen(true);
  }

  function cancel() {
    setOpen(false);
  }

  async function approve() {
    const processingMilliseconds = paymentSteps.length * stepMilliseconds;
    await wait(Math.max(0, processingMilliseconds - (performance.now() - startedAt.current)));
    setStage("approved");
    await wait(approvedMilliseconds);
    setOpen(false);
  }

  return { open, stage, start, cancel, approve };
}
