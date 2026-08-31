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
    <section className="flex min-h-0 flex-col rounded-lg bg-card py-4 md:py-8">
      <h2 className="px-4 text-center text-lg font-semibold text-white md:px-5 md:text-2xl">
        {title}
      </h2>
      <div
        className={cn(
          "mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 md:mt-6 md:px-5",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
