# Scheduler Enhancements - Implementation Guide

## Summary

Enhanced `node-cron` scheduler with robust job management while keeping the simple, lightweight architecture.

## What Was Added

### 1. **Job Lock Mechanism**

**Purpose:** Prevent concurrent execution of the same job (e.g., if a job takes longer than the cron interval).

**Implementation:**

```javascript
const jobLocks = new Map();

function acquireJobLock(jobName) {
  if (jobLocks.has(jobName)) return false;
  jobLocks.set(jobName, true);
  return true;
}

function releaseJobLock(jobName) {
  jobLocks.delete(jobName);
}
```

**How it works:**

- Each job checks if a lock exists before running
- If locked, the job is skipped (no duplicate execution)
- Lock is released in `finally` block to ensure cleanup

**Example:**

```
00:00 - Job starts, acquires lock
00:00-00:15 - Job running (takes 15 seconds)
00:01 - Cron fires again, but lock exists → skip
00:00:15 - Job completes, releases lock
```

### 2. **Retry Wrapper with Exponential Backoff**

**Purpose:** Handle transient database errors when logging job runs.

**Implementation:**

```javascript
async function logJobRunWithRetry(
  jobName, status, itemsCount, errorMessage, durationMs, logger, maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.jobRun.create({ ... });
      return; // Success
    } catch (err) {
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt - 1) * 100; // 100ms, 200ms, 400ms
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
  // If all retries fail, log warning but don't throw
}
```

**Retry strategy:**

- Attempt 1: Immediate
- Attempt 2: Wait 100ms, then retry
- Attempt 3: Wait 200ms, then retry
- If all fail: Log warning, don't break scheduler

**Why this matters:** If Prisma connection momentarily fails, the job still completes successfully.

### 3. **Test Job (Every 2 Minutes)**

**Purpose:** Verify scheduler is working without waiting for real jobs to complete.

**Usage:**

```bash
# Enable test job
export ENABLE_TEST_JOB=true
npm run dev
```

**What it does:**

- Runs every 2 minutes (when enabled)
- Counts total JobRun records in database
- Logs entry to JobRun table for verification

**In logs you'll see:**

```
Test job (2-min interval) enabled via ENABLE_TEST_JOB
Test job executed: 42 total job runs recorded
```

**In admin dashboard:**

- Filter jobs by name → "test-job-2min"
- Should see new entries every 2 minutes

### 4. **All Existing Jobs Now Protected**

Each job now has lock + retry wrapper:

| Job                        | Interval     | Status       |
| -------------------------- | ------------ | ------------ |
| `deactivate-expired-items` | Every minute | ✅ Protected |
| `dedup-media`              | Every minute | ✅ Protected |
| `cleanup-tokens-analytics` | Daily 3 AM   | ✅ Protected |
| `test-job-2min`            | Every 2 min  | ✅ Optional  |

---

## Testing Procedure

### Step 1: Enable Test Job

```bash
cd backend
set ENABLE_TEST_JOB=true
npm run dev
```

### Step 2: Check Logs

Look for:

```
✓ Test job (2-min interval) enabled via ENABLE_TEST_JOB
✓ Test job executed: X total job runs recorded
```

### Step 3: Verify Admin Dashboard

1. Open admin dashboard: `http://localhost:5174`
2. Navigate to: **Tâches (Jobs)** tab
3. Select job: **test-job-2min** from statistics grid
4. Should show new entries every 2 minutes with:
   - Status: `success`
   - Items: Count of total runs
   - Duration: ~5-20ms

### Step 4: Test Lock Mechanism

Simulate slow job (manually, or check logs):

```
If dedup-media takes >60s, next minute's execution is skipped
Check logs: "Job dedup-media already running, skipping"
```

### Step 5: Disable Test Job

```bash
unset ENABLE_TEST_JOB  # or just restart without it
npm run dev
```

---

## Environment Variables

| Var               | Default | Effect                   |
| ----------------- | ------- | ------------------------ |
| `ENABLE_TEST_JOB` | `false` | Enable 2-minute test job |

---

## Admin Dashboard

**JobsView.vue** is read-only and shows:

1. **Statistics Grid** (top):
   - Job name
   - Total runs
   - Success/error counts
   - Last run time
   - Average duration
   - Total items processed

2. **History Table** (bottom):
   - Status badge (success/error/running)
   - Start/end times
   - Duration
   - Items count
   - Error message (if failed)
   - Pagination

**Authentication:** Admin-only via JWT bearer token

---

## No Regressions Guarantee

✅ All changes are **additive** (no breaking changes):

- Existing jobs continue to work identically
- Database schema unchanged (uses existing JobRun table)
- No new dependencies added
- No configuration required (test job is opt-in)

**Rollback:** Simply remove lock/retry code if needed (all backward compatible).

---

## Next Steps

After testing:

1. Disable test job for production
2. Keep enhanced scheduler running
3. Monitor admin Jobs dashboard for anomalies
4. Set alerts if jobs fail consistently

---

## Questions?

Check scheduler logs in admin dashboard or ask about:

- Job lock behavior
- Retry logic effectiveness
- Job duration trends
