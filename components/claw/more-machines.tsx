import Image from "next/image";
import Link from "next/link";
import { currency } from "@/lib/format";
import type { MachineSummary } from "@/lib/claw/types";

export function MoreMachines({ machines }: { machines: MachineSummary[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-base font-semibold leading-none text-white">
        More Claw Machines
      </h2>
      <ul className="grid grid-cols-3 gap-2">
        {machines.map((machine) => (
          <li key={machine.slug}>
            <Link
              href={`/claw/${machine.slug}`}
              className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-border-strong bg-secondary px-4 py-2.5 text-center transition-colors hover:border-primary/50 hover:bg-elevated"
            >
              <Image
                src={machine.icon}
                alt=""
                width={40}
                height={40}
                className="size-8 rounded-lg object-contain shadow-card"
              />
              <span className="flex flex-col gap-1">
                <span className="tnum text-sm font-semibold leading-none text-foreground">
                  {currency(machine.price)}
                </span>
                <span className="text-xs font-medium leading-4 text-secondary-foreground">
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
