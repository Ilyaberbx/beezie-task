const ASSAY_MARK_STEP_MS = 70;
const ASSAY_SWEEP_STEP_MS = 130;

export function assayMarkDelayMs(index: number): number {
  return index * ASSAY_MARK_STEP_MS;
}

export function assaySweepDelayMs(index: number): number {
  return index * ASSAY_SWEEP_STEP_MS;
}
