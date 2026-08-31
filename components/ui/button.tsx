import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gold-gradient text-primary-foreground shadow-gold hover:bg-gold-gradient-hover hover:shadow-gold-hover disabled:bg-none disabled:bg-primary/45 disabled:text-primary-foreground/70 disabled:shadow-none",
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
        "transition-[background-color,background-image,box-shadow,color,scale]",
        "active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
