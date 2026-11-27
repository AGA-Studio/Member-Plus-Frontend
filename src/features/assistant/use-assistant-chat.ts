import { useCallback, useEffect, useRef, useState } from "react";
import { buildHistory, type AssistantFailure, type AssistantMessage, type AssistantRole } from "@/lib/assistant";
import { sendToAssistant } from "./assistant-client";

export function useAssistantChat() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<AssistantFailure | null>(null);
  const sessionRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const countRef = useRef(0);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function createMessage(role: AssistantRole, content: string): AssistantMessage {
    countRef.current += 1;

    return { id: `message-${countRef.current}`, role, content, fresh: true };
  }

  async function request(history: AssistantMessage[]) {
    const controller = new AbortController();
    controllerRef.current = controller;
    setPending(true);
    setFailure(null);

    const outcome = await sendToAssistant(buildHistory(history), sessionRef.current, controller.signal);
    if (controllerRef.current !== controller) return;

    controllerRef.current = null;
    setPending(false);
    if (!outcome.ok) {
      setFailure(outcome.failure);
      return;
    }
    sessionRef.current = outcome.sessionId;
    const reply = createMessage("assistant", outcome.reply);
    setMessages((current) => [...current, reply]);
  }

  function send(text: string): boolean {
    const content = text.trim();
    if (!content || controllerRef.current) return false;

    const next = [...messages.map((message) => ({ ...message, fresh: false })), createMessage("user", content)];
    setMessages(next);
    void request(next);

    return true;
  }

  function retry() {
    if (controllerRef.current || messages.at(-1)?.role !== "user") return;

    void request(messages);
  }

  function stop() {
    if (!controllerRef.current) return;

    controllerRef.current.abort();
    controllerRef.current = null;
    setPending(false);
    setFailure("stopped");
  }

  function reset() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    sessionRef.current = null;
    setMessages([]);
    setPending(false);
    setFailure(null);
  }

  const markShown = useCallback((id: string) => {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, fresh: false } : message)));
  }, []);

  return { messages, pending, failure, send, retry, stop, reset, markShown };
}

export type AssistantChat = ReturnType<typeof useAssistantChat>;
