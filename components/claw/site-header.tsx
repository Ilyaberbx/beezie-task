import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";
import { DEFAULT_MACHINE_SLUG } from "@/lib/claw/mock";
import { WalletBalance } from "./wallet-balance";

const CLAW_HREF = `/claw/${DEFAULT_MACHINE_SLUG}`;

const NAV = [
  { label: "Marketplace", href: "/" },
  { label: "Claw", href: CLAW_HREF, active: true },
  { label: "Leaderboard", href: "/" },
  { label: "Resources", href: "/" },
  { label: "More", href: "/" },
];

export function SiteHeader() {
  return (
    <header data-header className="sticky top-0 z-30 h-16 animate-fade-in border-b border-border/60 bg-background/85 backdrop-blur-md lg:h-21 lg:border-b-0 lg:backdrop-blur-none">
      <div className="mx-auto flex h-full max-w-[1440px] items-center px-4 lg:px-[50px]">
        <Link href={CLAW_HREF} aria-label="Beezie home" className="shrink-0">
          <Image
            src={asset("/media/beezie-logo.svg")}
            alt="Beezie"
            width={94}
            height={40}
            priority
            className="hidden lg:block"
          />
          <Image
            src={asset("/media/beezie-mark.svg")}
            alt="Beezie"
            width={22}
            height={32}
            priority
            className="lg:hidden"
          />
        </Link>

        <nav className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center">
            {NAV.map((entry) => (
              <li key={entry.label}>
                <Link
                  href={entry.href}
                  aria-current={entry.active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-[5px] rounded-md px-5 text-base font-medium transition-colors",
                    entry.active ? "" : "text-white hover:text-primary",
                  )}
                >
                  {entry.active && (
                    <Image
                      src={asset("/media/icons/sparkle-claw.svg")}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4"
                    />
                  )}
                  <span
                    className={cn(
                      entry.active &&
                        "bg-linear-to-b/srgb from-[#ffb000] via-[#ffca28] to-[#ffe082] bg-clip-text text-transparent",
                    )}
                  >
                    {entry.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-6">
          <WalletBalance />
          <Image
            src={asset("/media/avatar.webp")}
            alt="Your profile"
            width={40}
            height={40}
            className="size-9 rounded-full object-cover ring-1 ring-border lg:size-10"
          />
        </div>
      </div>
    </header>
  );
}
