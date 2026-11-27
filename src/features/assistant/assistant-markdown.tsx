import { Fragment } from "react";
import type { ReplyBlock, Segment } from "@/lib/assistant";
import { cx } from "@/lib/cx";

type WordsProps = {
  segments: Segment[];
  animated: boolean;
};

function Words({ segments, animated }: WordsProps) {
  return segments.map((segment, segmentIndex) => {
    const words = segment.words.map((word, wordIndex) => (
      <span
        key={wordIndex}
        className={animated ? "transition-opacity duration-250 ease-out starting:opacity-0" : undefined}
      >
        {word}
      </span>
    ));

    if (segment.kind === "strong") {
      return (
        <strong key={segmentIndex} className="font-semibold">
          {words}
        </strong>
      );
    }
    if (segment.kind === "code") {
      return (
        <code key={segmentIndex} className="rounded-xs bg-surface-muted px-1 font-mono text-sm">
          {words}
        </code>
      );
    }

    return <Fragment key={segmentIndex}>{words}</Fragment>;
  });
}

type AssistantMarkdownProps = {
  blocks: ReplyBlock[];
  animated: boolean;
};

export function AssistantMarkdown({ blocks, animated }: AssistantMarkdownProps) {
  return (
    <div className="flex flex-col gap-3 text-base text-foreground">
      {blocks.map((block, blockIndex) => {
        if (block.kind === "paragraph") {
          return (
            <p key={blockIndex} className={cx("wrap-break-word", block.heading && "font-semibold")}>
              {block.lines.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 ? <br /> : null}
                  <Words segments={line} animated={animated} />
                </Fragment>
              ))}
            </p>
          );
        }
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";

          return (
            <List key={blockIndex} className={cx("flex flex-col gap-1.5 pl-6", block.ordered ? "list-decimal" : "list-disc")}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="wrap-break-word marker:text-muted">
                  <Words segments={item} animated={animated} />
                </li>
              ))}
            </List>
          );
        }

        return (
          <div key={blockIndex} className="max-w-full overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm tabular-nums">
              <thead className="bg-surface-muted">
                <tr>
                  {block.head.map((cell, cellIndex) => (
                    <th key={cellIndex} scope="col" className="px-3 py-2 font-semibold">
                      <Words segments={cell} animated={animated} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-border">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2">
                        <Words segments={cell} animated={animated} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
