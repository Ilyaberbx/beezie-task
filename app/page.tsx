"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client-side: a server redirect() cannot be prerendered into a static export.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/claw/pokemon-gold");
  }, [router]);
  return null;
}
