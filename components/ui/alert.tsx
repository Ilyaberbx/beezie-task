import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function Alert({
  id,
  title,
  actions,
}: {
  id?: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div
      id={id}
      role="alert"
      className="flex animate-fade-in flex-wrap items-center gap-x-2.5 gap-y-2 rounded-md border border-primary/30 bg-primary/8 px-3 py-2.5"
    >
      <CircleAlert className="size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-medium text-primary">{title}</p>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
