"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

/** WAI-ARIA tabs with arrow-key navigation. */
export function Tabs({ tabs, initialTab }: { tabs: Tab[]; initialTab?: string }) {
  const baseId = useId();
  const [active, setActive] = useState(initialTab ?? tabs[0]?.id);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const tab = tabs[next];
    if (tab) {
      setActive(tab.id);
      document.getElementById(`${baseId}-tab-${tab.id}`)?.focus();
    }
  }

  return (
    <div>
      <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`${baseId}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "h-9 shrink-0 rounded-full px-4 text-sm whitespace-nowrap transition-colors",
              active === tab.id
                ? "bg-ink text-paper"
                : "text-muted ring-1 ring-line hover:text-ink hover:ring-ink/30",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={active !== tab.id}
          className="pt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
