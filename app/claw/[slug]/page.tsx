import type { Metadata } from "next";
import { ClawMachinePage } from "@/components/claw/claw-machine-page";
import { MACHINES, findMachine } from "@/lib/claw/mock";

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
  return <ClawMachinePage slug={slug} />;
}
