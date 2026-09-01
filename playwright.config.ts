import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = `http://127.0.0.1:${PORT}`;

// Autoplay is the whole point of the reveal overlay: without this the video
// specs stall on a gesture that never comes.
const launchOptions = { args: ["--autoplay-policy=no-user-gesture-required"] };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "list" : "html",
  use: { baseURL, trace: "on-first-retry" },

  projects: [
    {
      // The deterministic lane: reduced motion collapses the reveal video to a
      // no-op, so every stage transition is driven by state, not by playback.
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions,
        contextOptions: { reducedMotion: "reduce" },
      },
      testIgnore: /reveal-video\.spec\.ts/,
    },
    {
      // Real motion, real decoding — only the spec that is about the video.
      name: "chromium-motion",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions,
        contextOptions: { reducedMotion: "no-preference" },
      },
      testMatch: /reveal-video\.spec\.ts/,
    },
  ],

  webServer: {
    // output: "export" means `next start` serves nothing; the build lands in out/.
    // NEXT_PUBLIC_BASE_PATH stays unset so basePath is "" and baseURL paths work.
    command: `pnpm build && node e2e/static-server.mjs ${PORT}`,
    url: baseURL,
    timeout: 5 * 60 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
  },
});
