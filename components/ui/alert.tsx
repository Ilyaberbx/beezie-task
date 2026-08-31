import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function Alert({
  id,
  title,
  children,
  actions,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      id={id}
      role="alert"
      className="flex animate-fade-in flex-col gap-2.5 rounded-md border-l border-primary bg-secondary px-3 py-2.5"
    >
      <div className="flex gap-2">
        <CircleAlert
          className="mt-px size-4 shrink-0 text-primary"
          strokeWidth={2}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-primary">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-secondary-foreground">
            {children}
          </p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 pl-6">{actions}</div>}
    </div>
  );
}
