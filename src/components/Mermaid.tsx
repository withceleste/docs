"use client";

import mermaid from "mermaid";
import { useEffect, useState } from "react";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chart) return;

    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        setError("Failed to render diagram");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-500 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
        {error}
        <pre className="mt-2 overflow-x-auto text-xs opacity-50">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      className="my-6 flex justify-center overflow-x-auto rounded-lg bg-white p-4 dark:bg-neutral-900"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
