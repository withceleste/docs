"use client";

import { useState, Children, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MethodSelectorProps {
  items: string[];
  children: ReactNode;
}

export function MethodSelector({ items, children }: MethodSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Filter out whitespace/text nodes to get only the element children (the divs)
  const validChildren = Children.toArray(children).filter(isValidElement);

  return (
    <div className="not-prose my-6 flex flex-col">
      <div className="mb-4 flex self-start rounded-lg bg-fd-muted/50 p-1 ring-1 ring-fd-border">
        {items.map((item, index) => (
          <button
            key={item}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fd-primary/50",
              selectedIndex === index
                ? "bg-fd-background text-fd-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {validChildren.map((child, index) => (
        <div 
          key={index} 
          className={cn(
            "animate-in fade-in slide-in-from-top-1 duration-200", 
            selectedIndex === index ? "block" : "hidden"
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
