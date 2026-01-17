"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils"; // Assuming a utility for classnames exists or I'll inline it

// Simplified cn utility if it doesn't exist in context
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type PackageManager = "uv" | "pip" | "poetry";

const MANAGERS: { id: PackageManager; label: string }[] = [
  { id: "uv", label: "uv" },
  { id: "pip", label: "pip" },
  { id: "poetry", label: "poetry" },
];

export function InstallSelector() {
  const [manager, setManager] = useState<PackageManager>("uv");
  const [copied, setCopied] = useState(false);

  const getCommand = () => {
    const packageSpec = "celeste-ai";

    switch (manager) {
      case "uv":
        return `uv add ${packageSpec}`;
      case "pip":
        return `pip install ${packageSpec}`;
      case "poetry":
        return `poetry add ${packageSpec}`;
    }
  };

  const command = getCommand();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose my-8 rounded-xl border border-fd-border bg-fd-card/50 p-6 shadow-sm">
      {/* Header / Package Manager Selection */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm font-medium text-fd-muted-foreground">
          Install using
        </div>
        <div className="flex rounded-lg bg-fd-muted/50 p-1 ring-1 ring-fd-border">
          {MANAGERS.map((m) => (
            <button
              key={m.id}
              onClick={() => setManager(m.id)}
              className={classNames(
                "relative rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200",
                manager === m.id
                  ? "bg-fd-background text-fd-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command Output */}
      <div className="relative group overflow-hidden rounded-lg border border-fd-border bg-[#0d1117] dark:bg-black">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 overflow-x-auto font-mono text-sm text-gray-300">
            <Terminal className="h-4 w-4 shrink-0 text-fd-muted-foreground" />
            <span className="whitespace-nowrap select-all">
              <span className="text-purple-400">
                {manager === "pip" ? "pip" : manager}
              </span>{" "}
              <span className="text-gray-400">
                {manager === "pip" ? "install" : "add"}
              </span>{" "}
              <span className="text-green-400">celeste-ai</span>
            </span>
          </div>
          <button
            onClick={copyToClipboard}
            className="shrink-0 rounded-md p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-fd-primary/50"
            aria-label="Copy command"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
