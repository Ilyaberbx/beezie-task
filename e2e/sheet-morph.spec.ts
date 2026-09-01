import { expect, test } from "@playwright/test";

// A bottom-anchored sheet only ever shows its top edge move, so the resize rides a
// transform. Animating width/height instead put a relayout in every frame, which is
// what made these transitions stutter on a phone.
test.use({
  viewport: { width: 390, height: 844 },
  contextOptions: { reducedMotion: "no-preference" },
});

test("a sheet resizes on the compositor and stays glued to the bottom edge", async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");
  await expect(page.getByRole("heading", { name: "Pokémon Gold Claw", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Start Now" }).dispatchEvent("click");
  await expect(page.getByRole("dialog", { name: "Review and pay" })).toBeVisible();

  // Driven from inside the page: a round-trip per step would outrun a 320ms morph.
  const runs = await page.evaluate(async () => {
    const sheet = document.querySelector<HTMLDialogElement>('dialog[aria-label="Review and pay"]')!;
    const animated: string[][] = [];
    const real = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (this === sheet && Array.isArray(keyframes)) {
        animated.push([...new Set(keyframes.flatMap((frame) => Object.keys(frame)))]);
      }
      return real.call(this, keyframes, options);
    };

    const results = [];
    for (const label of ["Credit/ Debit", "Wallet"]) {
      animated.length = 0;
      const edges: { top: number; bottom: number }[] = [];
      const settled = new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = () => {
          const box = sheet.getBoundingClientRect();
          edges.push({ top: Math.round(box.top), bottom: Math.round(box.bottom) });
          if (performance.now() - start < 420) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

      const tab = [...sheet.querySelectorAll("button")].find((b) => b.textContent?.trim() === label);
      tab!.click();
      await settled;

      await new Promise((r) => setTimeout(r, 600));

      results.push({
        animated: animated.flat(),
        topTravel: Math.max(...edges.map((e) => e.top)) - Math.min(...edges.map((e) => e.top)),
        worstGapBelow: Math.max(...edges.map((e) => window.innerHeight - e.bottom)),
        leftoverHeight: sheet.style.height,
        leftoverTransform: sheet.style.transform,
      });
    }

    Element.prototype.animate = real;
    return results;
  });

  for (const run of runs) {
    expect(run.animated).toContain("transform");
    expect(run.animated).not.toContain("width");
    expect(run.animated).not.toContain("height");
    expect(run.topTravel).toBeGreaterThan(0);
    // Overhang past the bottom edge is the point; a positive value is a visible gap.
    expect(run.worstGapBelow).toBeLessThanOrEqual(0);
    expect(run.leftoverHeight).toBe("");
    expect(run.leftoverTransform).toBe("");
  }
});

test("the sheet exit eases in over 260ms rather than lunging", async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");
  await page.getByRole("button", { name: "Start Now" }).dispatchEvent("click");
  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();

  // Dismiss and read in one round-trip; a separate one would land after the exit.
  const exit = await review.evaluate(async (el) => {
    el.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
    await new Promise((frame) => requestAnimationFrame(frame));
    const style = getComputedStyle(el);
    return {
      name: style.animationName,
      duration: style.animationDuration,
      easing: style.animationTimingFunction,
    };
  });

  expect(exit.name).toBe("sheet-out");
  expect(exit.duration).toBe("0.26s");
  // An ease-in: the first control point sits on the floor, so it leaves slowly.
  expect(exit.easing).toBe("cubic-bezier(0.32, 0, 0.67, 0)");
});
