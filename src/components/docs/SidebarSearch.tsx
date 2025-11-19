"use client";

import { Search } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { useEffect, type ReactElement } from "react";
import { cn } from "@/lib/utils";

interface SidebarSearchProps {
  className?: string;
}

export function SidebarSearch({ className }: SidebarSearchProps): ReactElement {
  const { setOpenSearch, enabled } = useSearchContext();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenSearch(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpenSearch, enabled]);

  if (!enabled) {
    return <></>;
  }

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className={cn(
        "w-full flex items-center gap-2 rounded-md border border-fd-border bg-fd-popover px-3 py-2 text-sm text-fd-muted-foreground transition-colors",
        "hover:bg-fd-muted/50 hover:text-fd-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2",
        className,
      )}
      aria-label="Search documentation"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">Search</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-fd-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
