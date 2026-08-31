import { notFound } from "next/navigation";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { SiteHeader } from "@/components/claw/site-header";
import { MachineStage } from "@/components/claw/machine-stage";
import { ClawExperience } from "@/components/claw/claw-experience";
import { OddsGrid } from "@/components/claw/odds-grid";
import { MoreMachines } from "@/components/claw/more-machines";
import { TopItems } from "@/components/claw/top-items";
import { RecentPulls } from "@/components/claw/recent-pulls";
import { Separator } from "@/components/ui/separator";
import { clawQueries, fetchRecentPulls, fetchTopItems } from "@/lib/claw/queries";
import { findMachine } from "@/lib/claw/mock";
import { currency } from "@/lib/format";

export async function ClawMachinePage({ slug }: { slug: string }) {
  const machine = findMachine(slug);
  if (!machine) notFound();

  const queryClient = new QueryClient();
  const [topItems, recentPulls] = await Promise.all([
    fetchTopItems(),
    fetchRecentPulls(),
    queryClient.prefetchQuery(clawQueries.machine(slug)),
    queryClient.prefetchQuery(clawQueries.wallet()),
    queryClient.prefetchQuery(clawQueries.paymentMethods()),
    queryClient.prefetchQuery(clawQueries.prizeHighlights()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 pb-28 pt-2 md:gap-6 md:px-[50px] md:pb-12 md:pt-7">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <MachineStage
            name={machine.name}
            video={machine.idleVideo}
            poster={machine.poster}
          />

          <div className="flex flex-col gap-5 rounded-xl border border-border bg-card-gradient px-4 py-5 shadow-sm md:gap-4 md:rounded-panel md:bg-card-gradient-wide md:p-5">
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold leading-7 text-foreground md:text-2xl md:leading-8">
                  {machine.name}
                </h1>
                <p className="text-sm font-medium leading-5 text-secondary-foreground">
                  {machine.tagline}
                </p>
              </div>

              <p className="flex items-center gap-2 md:gap-1.5">
                <span className="tnum text-xl font-semibold leading-8 text-foreground md:text-2xl">
                  {currency(machine.price)}
                </span>
                <span className="tnum text-xs font-semibold text-primary md:text-sm">
                  +{machine.points} points
                </span>
              </p>

              <ClawExperience slug={slug} />
            </div>

            <Separator />
            <OddsGrid odds={machine.odds} averageValue={machine.averageValue} />
            <Separator />
            <MoreMachines machines={machine.siblings} />
          </div>
        </div>

        <div className="grid min-h-0 gap-4 max-md:grid-rows-[596px_606px] md:grid-cols-2 md:gap-6 lg:h-[800px]">
          <TopItems items={topItems} />
          <RecentPulls pulls={recentPulls} />
        </div>
      </main>
    </HydrationBoundary>
  );
}
