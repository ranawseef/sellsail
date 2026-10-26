// What a job run receives and returns.

export type JobCtx = {
  jobId: number;
  tenantId: number;
  targetId: number;
  state: Record<string, unknown>;
  /** Epoch ms after which the run must wrap up and return. */
  deadline: number;
  /** Extends the lease; call between batches. Returns false if the lease was lost. */
  heartbeat(): Promise<boolean>;
  /** True when the workspace was paused or the job disabled mid-run. */
  shouldStop(): Promise<boolean>;
  sleep(ms: number): Promise<void>;
};

export type RunResult = {
  ok: boolean;
  msg: string;
  /** Seconds until the next run; defaults to the job's interval. */
  nextInS?: number;
  /**
   * Waiting on something outside the seller's control (e.g. platform Amazon
   * pricing not started yet): update the job's status but leave no run row
   * or event, so the seller's history isn't filled with non-failures.
   */
  quiet?: boolean;
  /** Disable the job after this run (a finished import, a deleted account). */
  disable?: boolean;
  state?: Record<string, unknown>;
  progress?: { done: number; total: number; note: string };
};

export function timeLeft(ctx: JobCtx): number {
  return ctx.deadline - Date.now();
}
