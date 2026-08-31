import type { Metadata } from "next";
import { ClawMachinePage } from "@/components/claw/claw-machine-page";
import { DEFAULT_MACHINE_SLUG } from "@/lib/claw/mock";

export const metadata: Metadata = {
  alternates: { canonical: `/claw/${DEFAULT_MACHINE_SLUG}` },
};

export default function Home() {
  return <ClawMachinePage slug={DEFAULT_MACHINE_SLUG} />;
}
