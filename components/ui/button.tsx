import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-[#ffd451] disabled:bg-primary/45 disabled:text-primary-foreground/70",
  secondary:
    "bg-secondary text-foreground hover:bg-elevated disabled:text-muted-foreground",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:bg-elevated disabled:text-muted-foreground",
  ghost:
    "bg-transparent text-secondary-foreground hover:bg-secondary hover:text-foreground",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold",
        "transition-[background-color,color,scale]",
        "active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
