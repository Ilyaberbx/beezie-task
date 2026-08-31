"use client";

export default function ClawError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">The claw jammed</h1>
      <p className="text-sm text-secondary-foreground">
        {error.message || "Something went wrong loading this machine."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#ffd451]"
      >
        Try again
      </button>
    </main>
  );
}
