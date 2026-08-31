import Link from "next/link";
import { DEFAULT_MACHINE_SLUG } from "@/lib/claw/mock";

export default function ClawNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">
        This claw machine is not on the floor
      </h1>
      <p className="text-sm text-secondary-foreground">
        It may have been retired or restocked under another name.
      </p>
      <Link
        href={`/claw/${DEFAULT_MACHINE_SLUG}`}
        className="mt-2 inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#ffd451]"
      >
        Back to the Claw
      </Link>
    </main>
  );
}
