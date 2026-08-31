import Image from "next/image";
import { currency } from "@/lib/format";
import { SectionPanel } from "./section-panel";
import { Separator } from "@/components/ui/separator";
import type { TopItem } from "@/lib/claw/types";

export function TopItems({ items }: { items: TopItem[] }) {
  return (
    <SectionPanel title="Top Items">
      <ul className="grid grid-cols-2 gap-2.5 pb-1 md:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-1 rounded-lg border border-border-strong bg-secondary p-1"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-white">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 200px, 45vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 px-2 py-1.5">
              <p className="line-clamp-2 text-[10px] font-medium leading-[1.3] text-white">
                {item.title}
              </p>
              <Separator />
              <p className="flex items-center gap-1.5 leading-none">
                <span className="text-[10px] font-medium text-secondary-foreground">
                  FMV
                </span>
                <span className="tnum text-xs font-semibold text-rarity-ultra">
                  {currency(item.fairMarketValue)}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}
