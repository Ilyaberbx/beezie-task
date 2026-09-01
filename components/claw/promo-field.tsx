"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export function PromoField({ className }: { className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState("");
  const fieldId = useId();

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls={fieldId}
        className="-my-3 flex w-fit items-center gap-1 py-3 text-xs font-medium leading-none text-foreground transition-colors hover:text-primary md:pointer-events-none md:hover:text-foreground"
      >
        Apply promo code
        <ChevronDown
          className={cn(
            "size-3 transition-transform duration-200 md:hidden",
            expanded && "rotate-180",
          )}
          strokeWidth={2.5}
        />
      </button>

      <div
        id={fieldId}
        className={cn("gap-2 md:flex", expanded ? "flex" : "hidden")}
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter Code"
          aria-label="Promo code"
          className="h-9 min-w-0 flex-1 pointer-coarse:h-11 rounded-md border border-[#232323] bg-[#232323] px-3 text-xs text-foreground transition-colors placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          disabled={code.trim().length === 0}
          className="h-9 shrink-0 rounded-md pointer-coarse:h-11 bg-[#232323] px-6 text-xs font-medium text-foreground transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:text-[#7c7c7c]"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
