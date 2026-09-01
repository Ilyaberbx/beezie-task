import { FadeImage } from "@/components/ui/fade-image";
import Link from "next/link";
import { currency } from "@/lib/format";
import type { MachineSummary } from "@/lib/claw/types";

export function MoreMachines({ machines }: { machines: MachineSummary[] }) {
  return (
    <section className="flex flex-1 flex-col gap-3 md:gap-2.5">
      <h2 className="text-sm font-semibold leading-none text-foreground md:text-base md:text-white">
        More Claw Machines
      </h2>
      <ul className="grid flex-1 grid-cols-3 gap-2">
        {machines.map((machine) => (
          <li key={machine.slug}>
            <Link
              href={`/claw/${machine.slug}`}
              data-lift
              className="flex h-full flex-col items-center justify-center gap-1.5 rounded-lg border border-border-strong bg-secondary px-2 py-2.5 text-center shadow-tile transition-[background-color,border-color,box-shadow,translate] hover:-translate-y-px hover:border-primary/50 hover:bg-elevated hover:shadow-tile-raised active:translate-y-0 md:gap-2 md:px-4 md:py-4"
            >
              <FadeImage
                src={machine.icon}
                alt=""
                width={40}
                height={40}
                className="size-8 rounded-lg object-contain shadow-card"
              />
              <span className="flex flex-col gap-0.5 md:gap-1">
                <span className="tnum text-sm font-semibold leading-none text-foreground">
                  {currency(machine.price)}
                </span>
                <span className="text-[10px] font-medium leading-4 text-secondary-foreground md:text-xs">
                  {machine.name}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
