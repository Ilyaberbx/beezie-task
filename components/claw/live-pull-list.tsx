"use client";

import { FadeImage } from "@/components/ui/fade-image";
import { thumb } from "@/lib/asset";
import { currency } from "@/lib/format";
import { useLiveRecentPulls } from "@/hooks/claw/use-live-recent-pulls";
import { livePullRowState } from "@/lib/claw/live-pulls";
import type { RecentPull } from "@/lib/claw/types";

export function LivePullList({ initial }: { initial: RecentPull[] }) {
  const pulls = useLiveRecentPulls(initial);

  return (
    <ul aria-live="off" className="-mb-2.5 flex flex-col">
      {pulls.map((pull, index) => (
        <li
          key={pull.id}
          data-pull={livePullRowState(index, pull.isLive)}
          className="group grid grid-rows-[1fr] data-[pull=entering]:animate-pull-in data-[pull=leaving]:animate-pull-out"
        >
          <div className="min-h-0 overflow-hidden pb-2.5">
            <div
              data-pull-row
              className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-2 shadow-tile group-data-[pull=entering]:animate-pull-flash @[26rem]:gap-2 @[26rem]:p-2.5"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-white @[26rem]:size-21">
                <FadeImage
                  src={thumb(pull.image)}
                  alt={pull.title}
                  fill
                  sizes="84px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 items-start justify-between gap-3 px-2">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-medium leading-[1.2] text-white @[26rem]:text-base @[26rem]:leading-6">
                    {pull.title}
                  </p>
                  <p className="mt-2 text-xs font-normal text-secondary-foreground @[26rem]:text-sm">
                    {pull.owner}
                  </p>
                </div>
                <p className="tnum shrink-0 text-sm font-semibold leading-5 text-white @[26rem]:text-lg @[26rem]:leading-7">
                  {currency(pull.price)}
                </p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
