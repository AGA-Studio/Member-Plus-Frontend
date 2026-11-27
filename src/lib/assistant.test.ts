import { describe, expect, it } from "vitest";
import {
  buildHistory,
  countWords,
  limitBlocks,
  messageMaxLength,
  parseInline,
  parseReply,
  revealStep,
  toAssistantFailure,
  type AssistantMessage,
} from "./assistant";

function message(index: number, content = `mensaje ${index}`): AssistantMessage {
  return { id: String(index), role: index % 2 === 0 ? "user" : "assistant", content, fresh: false };
}

describe("buildHistory", () => {
  it("keeps the last twenty messages in order, ending with the new question", () => {
    const messages = Array.from({ length: 25 }, (_, index) => message(index));
    const history = buildHistory(messages);

    expect(history).toHaveLength(20);
    expect(history[0]).toEqual({ role: "assistant", content: "mensaje 5" });
    expect(history.at(-1)).toEqual({ role: "user", content: "mensaje 24" });
  });

  it("cuts a long reply to what the API accepts and drops empty messages", () => {
    const history = buildHistory([message(1, "a".repeat(messageMaxLength + 50)), message(2, "   "), message(4, " hola ")]);

    expect(history.map((entry) => entry.content.length)).toEqual([messageMaxLength, 4]);
  });
});

describe("toAssistantFailure", () => {
  it.each([
    [401, null, "sessionExpired"],
    [403, "plan_required", "planRequired"],
    [403, null, "unavailable"],
    [503, "ai_unavailable", "unavailable"],
    [422, null, "unavailable"],
  ] as const)("reads %i %s as %s", (status, code, failure) => {
    expect(toAssistantFailure(status, code)).toBe(failure);
  });
});

describe("parseInline", () => {
  it("separates bold and code from plain words", () => {
    expect(parseInline("La tarjeta `MP-4F7K2` es **Oro puro**.")).toEqual([
      { kind: "text", words: ["La ", "tarjeta "] },
      { kind: "code", words: ["MP-4F7K2"] },
      { kind: "text", words: [" es "] },
      { kind: "strong", words: ["Oro ", "puro"] },
      { kind: "text", words: ["."] },
    ]);
  });

  it("keeps unmatched marks as text", () => {
    expect(parseInline("2 ** 3")).toEqual([{ kind: "text", words: ["2 ", "** ", "3"] }]);
  });
});

describe("parseReply", () => {
  it("builds paragraphs, headings, lists and tables", () => {
    const blocks = parseReply(
      "## Resumen\r\nVas bien.\nSigue así.\n\n- Uno\n- Dos\n1. Primero\n2) Segundo\n\n| Nivel | Clientes |\n| --- | ---: |\n| Oro | 3 |\n| Plata | 5 |\nFin",
    );

    expect(blocks.map((block) => block.kind)).toEqual(["paragraph", "paragraph", "list", "list", "table", "paragraph"]);
    expect(blocks[0]).toMatchObject({ heading: true });
    expect(blocks[1]).toMatchObject({ heading: false, lines: [expect.anything(), expect.anything()] });
    expect(blocks[2]).toMatchObject({ ordered: false, items: [expect.anything(), expect.anything()] });
    expect(blocks[3]).toMatchObject({ ordered: true });
    expect(blocks[4]).toMatchObject({ head: [expect.anything(), expect.anything()], rows: [expect.anything(), expect.anything()] });
  });

  it("reads a pipe line without a divider as text", () => {
    expect(parseReply("| no es tabla |").map((block) => block.kind)).toEqual(["paragraph"]);
  });

  it("counts the words of every block", () => {
    expect(countWords(parseReply("Hola mundo\n- uno dos\n\n| a |\n| --- |\n| b c |"))).toBe(7);
    expect(countWords([])).toBe(0);
  });
});

describe("revealStep", () => {
  it.each([
    [0, 1],
    [60, 1],
    [61, 2],
    [600, 10],
  ])("reveals %i words in steps of %i", (words, step) => {
    expect(revealStep(words)).toBe(step);
  });
});

describe("limitBlocks", () => {
  const blocks = parseReply("Uno **dos tres**\n\n- cuatro\n- cinco\n\n| seis |\n| --- |\n| siete |\n| ocho |");

  it.each([0, 1, 3, 4, 6, 8])("shows exactly %i words", (limit) => {
    expect(countWords(limitBlocks(blocks, limit))).toBe(limit);
  });

  it("leaves out what has not started and keeps everything at the end", () => {
    expect(limitBlocks(blocks, 4).map((block) => block.kind)).toEqual(["paragraph", "list"]);
    expect(limitBlocks(blocks, 100)).toEqual(blocks);
  });
});
