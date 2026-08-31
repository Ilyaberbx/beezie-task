import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves the repo at /beezie-task; unset locally so `next dev` stays at /.
  basePath: process.env.PAGES_BASE_PATH ?? "",
  // Pages has no rewrite rules, so every route needs its own index.html.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
