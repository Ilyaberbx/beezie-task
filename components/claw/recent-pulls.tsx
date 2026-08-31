import Image from "next/image";
import { currency } from "@/lib/format";
import { SectionPanel } from "./section-panel";
import type { RecentPull } from "@/lib/claw/types";

export function RecentPulls({ pulls }: { pulls: RecentPull[] }) {
  return (
    <SectionPanel title="Recent Pulls">
      <ul className="flex flex-col gap-2.5 pb-1">
        {pulls.map((pull) => (
          <li
            key={pull.id}
            className="flex items-center gap-3 rounded-lg border border-border-strong bg-secondary p-2 md:gap-4 md:p-2.5"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-white md:size-21">
              <Image
                src={pull.image}
                alt={pull.title}
                fill
                sizes="84px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-white md:text-base">
                  {pull.title}
                </p>
                <p className="mt-1 text-xs font-medium text-secondary-foreground md:mt-2 md:text-sm">
                  {pull.owner}
                </p>
              </div>
              <p className="tnum shrink-0 text-base font-semibold text-white md:text-xl">
                {currency(pull.price)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}
