import { LivePullList } from "./live-pull-list";
import { SectionPanel } from "./section-panel";
import type { RecentPull } from "@/lib/claw/types";

export function RecentPullsSection({ pulls }: { pulls: RecentPull[] }) {
  return (
    <SectionPanel title="Recent Pulls">
      <LivePullList initial={pulls} />
    </SectionPanel>
  );
}
