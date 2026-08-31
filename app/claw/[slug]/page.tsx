import type { Metadata } from "next";
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
import { clawQueries } from "@/lib/claw/queries";
import { MACHINES, findMachine } from "@/lib/claw/mock";
import { currency } from "@/lib/format";

export function generateStaticParams() {
  return MACHINES.map((machine) => ({ slug: machine.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/claw/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const machine = findMachine(slug);
  if (!machine) return {};
  return { title: `${machine.name} — Beezie`, description: machine.tagline };
}

export default async function ClawPage({ params }: PageProps<"/claw/[slug]">) {
  const { slug } = await params;
  const machine = findMachine(slug);
  if (!machine) notFound();

  const queryClient = new QueryClient();
  const [topItems, recentPulls] = await Promise.all([
    queryClient.fetchQuery(clawQueries.topItems()),
    queryClient.fetchQuery(clawQueries.recentPulls()),
    queryClient.prefetchQuery(clawQueries.wallet()),
    queryClient.prefetchQuery(clawQueries.machine(slug)),
    queryClient.prefetchQuery(clawQueries.paymentMethods()),
    queryClient.prefetchQuery(clawQueries.prizeHighlights()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 pb-28 md:gap-6 md:px-[46px] md:pb-12">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <MachineStage
            name={machine.name}
            video={machine.idleVideo}
            poster={machine.poster}
          />

          <div className="flex flex-col gap-4 rounded-lg bg-card p-4 md:gap-4 md:p-5">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold leading-tight text-white md:text-2xl">
                  {machine.name}
                </h1>
                <p className="text-sm font-medium leading-5 text-secondary-foreground">
                  {machine.tagline}
                </p>
              </div>

              <p className="flex items-baseline gap-3">
                <span className="tnum text-xl font-semibold text-white md:text-2xl">
                  {currency(machine.price)}
                </span>
                <span className="tnum text-xs font-semibold text-primary">
                  +{machine.points} points
                </span>
              </p>
            </div>

            <ClawExperience slug={slug} />

            <Separator />
            <OddsGrid odds={machine.odds} averageValue={machine.averageValue} />
            <Separator />
            <MoreMachines machines={machine.siblings} />
          </div>
        </div>

        <div className="grid min-h-0 gap-4 md:grid-cols-2 md:gap-6 lg:h-[800px]">
          <TopItems items={topItems} />
          <RecentPulls pulls={recentPulls} />
        </div>
      </main>
    </HydrationBoundary>
  );
}
