export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  fresh: boolean;
};

export type AssistantFailure = "planRequired" | "unavailable" | "sessionExpired" | "stopped" | "offline";

export const messageMaxLength = 2000;

const historyMaxMessages = 20;

export type HistoryEntry = { role: AssistantRole; content: string };

export function buildHistory(messages: readonly AssistantMessage[]): HistoryEntry[] {
  return messages
    .map(({ role, content }) => ({ role, content: content.trim().slice(0, messageMaxLength) }))
    .filter(({ content }) => content !== "")
    .slice(-historyMaxMessages);
}

export function toAssistantFailure(status: number, code: string | null): AssistantFailure {
  if (status === 401) return "sessionExpired";
  if (code === "plan_required") return "planRequired";

  return "unavailable";
}

export type Segment = { kind: "text" | "strong" | "code"; words: string[] };

export type ReplyBlock =
  | { kind: "paragraph"; heading: boolean; lines: Segment[][] }
  | { kind: "list"; ordered: boolean; items: Segment[][] }
  | { kind: "table"; head: Segment[][]; rows: Segment[][][] };

const inlinePattern = /(\*\*[^*]+\*\*|`[^`]+`)/;
const bulletPattern = /^\s*[-*•]\s+/;
const numberPattern = /^\s*\d+[.)]\s+/;
const headingPattern = /^\s*#{1,6}\s+/;
const tableDividerPattern = /^\s*\|?(\s*:?-{2,}:?\s*\|)+\s*(:?-{2,}:?)?\s*$/;

function splitWords(text: string): string[] {
  return text.match(/\s*\S+\s*/g) ?? [];
}

export function parseInline(text: string): Segment[] {
  return text
    .split(inlinePattern)
    .filter((part) => part !== "")
    .map((part): Segment => {
      if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
        return { kind: "strong", words: splitWords(part.slice(2, -2)) };
      }
      if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
        return { kind: "code", words: [part.slice(1, -1)] };
      }

      return { kind: "text", words: splitWords(part) };
    })
    .filter((segment) => segment.words.length > 0);
}

function tableCells(line: string): Segment[][] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => parseInline(cell.trim()));
}

export function parseReply(reply: string): ReplyBlock[] {
  const lines = reply.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReplyBlock[] = [];
  let openBlock: ReplyBlock | null = null;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === "") {
      openBlock = null;
      index += 1;
      continue;
    }

    if (line.trim().startsWith("|") && tableDividerPattern.test(lines[index + 1] ?? "")) {
      const rows: Segment[][][] = [];
      let next = index + 2;
      while (next < lines.length && lines[next].trim().startsWith("|")) {
        rows.push(tableCells(lines[next]));
        next += 1;
      }
      blocks.push({ kind: "table", head: tableCells(line), rows });
      openBlock = null;
      index = next;
      continue;
    }

    const ordered = numberPattern.test(line);
    if (ordered || bulletPattern.test(line)) {
      const item = parseInline(line.replace(ordered ? numberPattern : bulletPattern, ""));
      if (openBlock?.kind === "list" && openBlock.ordered === ordered) {
        openBlock.items.push(item);
      } else {
        openBlock = { kind: "list", ordered, items: [item] };
        blocks.push(openBlock);
      }
      index += 1;
      continue;
    }

    if (headingPattern.test(line)) {
      blocks.push({ kind: "paragraph", heading: true, lines: [parseInline(line.replace(headingPattern, ""))] });
      openBlock = null;
      index += 1;
      continue;
    }

    if (openBlock?.kind === "paragraph") {
      openBlock.lines.push(parseInline(line.trim()));
    } else {
      openBlock = { kind: "paragraph", heading: false, lines: [parseInline(line.trim())] };
      blocks.push(openBlock);
    }
    index += 1;
  }

  return blocks;
}

function segmentsOf(block: ReplyBlock): Segment[][] {
  if (block.kind === "paragraph") return block.lines;
  if (block.kind === "list") return block.items;

  return [...block.head, ...block.rows.flat()];
}

export function countWords(blocks: readonly ReplyBlock[]): number {
  return blocks
    .flatMap(segmentsOf)
    .flat()
    .reduce((total, segment) => total + segment.words.length, 0);
}

export function limitBlocks(blocks: readonly ReplyBlock[], limit: number): ReplyBlock[] {
  let remaining = limit;

  function take(segments: Segment[]): Segment[] {
    return segments.flatMap((segment) => {
      const words = segment.words.slice(0, Math.max(0, remaining));
      remaining -= words.length;

      return words.length > 0 ? [{ ...segment, words }] : [];
    });
  }

  return blocks.flatMap((block): ReplyBlock[] => {
    if (remaining <= 0) return [];
    if (block.kind === "paragraph") {
      return [{ ...block, lines: block.lines.map(take).filter((line) => line.length > 0) }];
    }
    if (block.kind === "list") {
      return [{ ...block, items: block.items.map(take).filter((item) => item.length > 0) }];
    }
    const head = block.head.map(take);
    const rows = block.rows.flatMap((row) => (remaining > 0 ? [row.map(take)] : []));

    return [{ ...block, head, rows }];
  });
}

const revealTicks = 60;

export function revealStep(totalWords: number): number {
  return Math.max(1, Math.ceil(totalWords / revealTicks));
}
