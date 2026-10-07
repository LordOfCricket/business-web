import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Numbers and money read best right-aligned with tabular figures. */
  align?: "left" | "right";
  /** The row's title: shown first and unlabelled when the table stacks on phones. */
  primary?: boolean;
  className?: string;
}

/**
 * Responsive data table. On wide screens a real table; on phones either a horizontally scrolling table (default:
 * scorecards and standings, where columns must line up) or, with `stack`, one card per row with each cell labelled
 * (schedules and lists, where rows are read one at a time).
 */
export function Table<T>({
  caption,
  columns,
  rows,
  rowKey,
  stack = false,
  showCaption = false,
}: {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  stack?: boolean;
  showCaption?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface ring-1 ring-line",
        stack ? "max-sm:bg-transparent max-sm:ring-0" : "overflow-x-auto",
      )}
    >
      <table className={cn("w-full text-left text-sm", stack && "max-sm:block")}>
        <caption
          className={cn(
            showCaption ? "px-4 pt-4 pb-2 text-left font-medium text-ink" : "sr-only",
            stack && "max-sm:block",
          )}
        >
          {caption}
        </caption>
        <thead className={cn("text-xs tracking-wide text-muted uppercase", stack && "max-sm:sr-only")}>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "px-4 py-3 font-medium whitespace-nowrap",
                  c.align === "right" && "text-right",
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(stack && "max-sm:flex max-sm:flex-col max-sm:gap-3")}>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(
                "border-b border-line transition-colors last:border-b-0 hover:bg-canvas/60",
                stack &&
                  "max-sm:flex max-sm:flex-col max-sm:gap-1.5 max-sm:rounded-2xl max-sm:border-0 max-sm:bg-surface max-sm:p-4 max-sm:ring-1 max-sm:ring-line",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  data-label={c.header}
                  className={cn(
                    "px-4 py-3.5 align-middle",
                    c.align === "right" && "text-right tabular-nums",
                    stack &&
                      "max-sm:flex max-sm:items-baseline max-sm:justify-between max-sm:gap-4 max-sm:p-0 max-sm:text-left",
                    stack &&
                      !c.primary &&
                      "max-sm:before:text-xs max-sm:before:text-muted max-sm:before:content-[attr(data-label)]",
                    stack && c.primary && "max-sm:mb-1 max-sm:text-base",
                    c.className,
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
