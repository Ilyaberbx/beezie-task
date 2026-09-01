import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card py-4 shadow-panel md:rounded-panel md:py-8">
      <h2 className="px-4 text-center text-lg font-semibold leading-7 text-white md:px-5 md:text-2xl md:leading-8">
        {title}
      </h2>
      <div
        tabIndex={0}
        role="group"
        aria-label={title}
        className={cn(
          "@container mt-4 min-h-0 flex-1 px-4 focus-visible:outline-offset-[-2px]",
          "md:scroll-y md:mt-6 md:px-5",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
