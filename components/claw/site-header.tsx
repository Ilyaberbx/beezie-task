"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";
import { useWallet } from "@/hooks/claw/use-wallet";

const NAV = [
  { label: "Marketplace", href: "/" },
  { label: "Claw", href: "/claw/pokemon-gold", active: true },
  { label: "Leaderboard", href: "/" },
  { label: "Resources", href: "/" },
  { label: "More", href: "/" },
];

export function SiteHeader() {
  const wallet = useWallet();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/85 backdrop-blur-md lg:h-21 lg:border-b-0 lg:backdrop-blur-none">
      <div className="mx-auto flex h-full max-w-[1440px] items-center px-4 lg:px-[50px]">
        <Link href="/claw/pokemon-gold" aria-label="Beezie home" className="shrink-0">
          <Image
            src="/media/beezie-logo.svg"
            alt="Beezie"
            width={94}
            height={40}
            priority
            className="hidden lg:block"
          />
          <Image
            src="/media/beezie-mark.svg"
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
                      src="/media/icons/sparkle-claw.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-4"
                    />
                  )}
                  {/* The label carries Figma's own gold gradient, not a flat fill. */}
                  <span
                    className={cn(
                      entry.active &&
                        // /srgb because Figma interpolates in sRGB, not Tailwind's default oklab.
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
          <span className="hidden h-10 items-center gap-2.5 rounded-[7px] bg-card px-4 text-sm font-medium sm:flex">
            <Image
              src="/media/icons/wallet.svg"
              alt=""
              width={16}
              height={13}
              className="h-[13px] w-4"
            />
            <span key={wallet.balance} className="tnum animate-fade-in">
              {currency(wallet.balance)}
            </span>
          </span>
          <Image
            src="/media/avatar.webp"
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
