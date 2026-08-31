import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionPanel({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card py-4 shadow-sm md:rounded-panel md:py-8">
      <h2 className="flex items-center justify-center px-4 text-center text-lg font-semibold leading-7 text-white md:px-5 md:text-2xl md:leading-8">
        {title}
        {badge && <span className="-me-3.5 ms-2 flex">{badge}</span>}
      </h2>
      <div
        className={cn(
          "mt-4 min-h-0 flex-1 overflow-y-auto px-4 md:mt-6 md:px-5",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
