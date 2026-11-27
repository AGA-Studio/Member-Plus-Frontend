import { toAssistantFailure, type AssistantFailure, type HistoryEntry } from "@/lib/assistant";

export type AssistantOutcome =
  | { ok: true; reply: string; sessionId: string }
  | { ok: false; failure: AssistantFailure };

type ChatPayload = { reply?: unknown; session_id?: unknown; code?: unknown };

export async function sendToAssistant(
  messages: HistoryEntry[],
  sessionId: string | null,
  signal: AbortSignal,
): Promise<AssistantOutcome> {
  try {
    const response = await fetch("/api/v1/chat/send", {
      method: "POST",
      credentials: "same-origin",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, ...(sessionId ? { session_id: sessionId } : {}) }),
    });
    const payload = (await response.json().catch(() => null)) as ChatPayload | null;

    if (response.ok && typeof payload?.reply === "string" && typeof payload.session_id === "string") {
      return { ok: true, reply: payload.reply, sessionId: payload.session_id };
    }
    const code = typeof payload?.code === "string" ? payload.code : null;

    return { ok: false, failure: toAssistantFailure(response.status, code) };
  } catch {
    return { ok: false, failure: navigator.onLine === false ? "offline" : "unavailable" };
  }
}
