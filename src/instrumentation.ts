// Runs once when a Next.js server process starts. Starts the job scheduler
// (src/server/jobs/scheduler.ts) in Node processes, never during the build.
// Set SCHEDULER=off to run the site without background jobs.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.SCHEDULER === "off") return;
  if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
    console.warn("[jobs] no database configured; scheduler not started");
    return;
  }
  const { ensureSchedulerStarted } = await import("./server/jobs/scheduler");
  ensureSchedulerStarted();
}
