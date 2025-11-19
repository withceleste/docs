"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming a utility for classnames exists or I'll inline it

// Simplified cn utility if it doesn't exist in context
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type PackageManager = "uv" | "pip" | "poetry";
type Capability =
  | "all"
  | "text-generation"
  | "image-generation"
  | "video-generation"
  | "speech-generation";

const CAPABILITIES: { id: Capability; label: string; description?: string }[] =
  [
    { id: "all", label: "All Features", description: "Everything included" },
    { id: "text-generation", label: "Text", description: "LLMs & Chat" },
    {
      id: "image-generation",
      label: "Image",
      description: "Generation & Editing",
    },
    {
      id: "video-generation",
      label: "Video",
      description: "Creation & Analysis",
    },
    { id: "speech-generation", label: "Speech", description: "TTS & Audio" },
  ];

const MANAGERS: { id: PackageManager; label: string }[] = [
  { id: "uv", label: "uv" },
  { id: "pip", label: "pip" },
  { id: "poetry", label: "poetry" },
];

export function InstallSelector() {
  const [manager, setManager] = useState<PackageManager>("uv");
  const [capability, setCapability] = useState<Capability>("all");
  const [copied, setCopied] = useState(false);

  const getCommand = () => {
    const packageSpec = `celeste-ai[${capability}]`;
    // pip and poetry usually require quotes for brackets in zsh/bash
    const quotedSpec = `"${packageSpec}"`;

    switch (manager) {
      case "uv":
        return `uv add ${quotedSpec}`;
      case "pip":
        return `pip install ${quotedSpec}`;
      case "poetry":
        return `poetry add ${quotedSpec}`;
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

      {/* Capability Selection */}
      <div className="mb-8">
        <div className="mb-3 text-sm font-medium text-fd-muted-foreground">
          Select capabilities
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CAPABILITIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCapability(c.id)}
              className={classNames(
                "group flex flex-col items-start rounded-lg border p-3 text-left transition-all duration-200",
                capability === c.id
                  ? "border-fd-primary bg-fd-primary/5 ring-1 ring-fd-primary"
                  : "border-fd-border bg-fd-card hover:border-fd-primary/50 hover:bg-fd-accent/50",
              )}
            >
              <span
                className={classNames(
                  "text-sm font-semibold",
                  capability === c.id
                    ? "text-fd-primary"
                    : "text-fd-foreground",
                )}
              >
                {c.label}
              </span>
              {c.description && (
                <span className="mt-1 text-[10px] text-fd-muted-foreground">
                  {c.description}
                </span>
              )}
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
              <span className="text-green-400">
                "{`celeste-ai[${capability}]`}"
              </span>
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
