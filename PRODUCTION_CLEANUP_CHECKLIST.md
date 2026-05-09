# Production Cleanup Checklist

## Overview
Plan for removing UAT/test artifacts before production deployment.

---

## 1. **Backend Scheduler Code** 
### Location: `backend/src/lib/scheduler.js`

**Remove:**
- [ ] Test job cron definition (lines with `*/2 * * * *`)
- [ ] Test job logic block (entire function for `test-job-2min`)
- [ ] `ENABLE_TEST_JOB` environment variable check
- [ ] Test job logger message: `"Test job (2-min interval) enabled..."`

**Keep:**
- ✅ Job lock mechanism (production-critical)
- ✅ Retry wrapper logic (production-critical)
- ✅ All 3 main jobs (deactivate-expired-items, dedup-media, cleanup-tokens-analytics)

**Code to remove (approx line range):**
```javascript
// Test job: every 2 minutes (for testing/verification)
// Can be disabled in production via env variable
const enableTestJob = process.env.ENABLE_TEST_JOB === "true";
if (enableTestJob) {
  cron.schedule("*/2 * * * *", async () => {
    // ... entire test job block
  });
  logger.info("Test job (2-min interval) enabled via ENABLE_TEST_JOB");
}
```

---

## 2. **Environment Variables**
### Locations: `.env`, `.env.production`, Render dashboard

**Remove:**
- [ ] `ENABLE_TEST_JOB` from all `.env*` files
- [ ] Remove from Render environment variables if set
- [ ] Verify not in CI/CD pipeline configs

**Keep:**
- ✅ All other vars (DATABASE_URL, S3 configs, JWT_SECRET, etc.)

---

## 3. **Test/Documentation Files**
### Files to Delete (or Archive):

- [ ] `backend/TEST_SCHEDULER_INFO.txt`
- [ ] `backend/test-scheduler.sh`
- [ ] Consider: Keep or remove `SCHEDULER_ENHANCEMENTS.md` (might be useful for ops)

**Recommendation:** 
- DELETE: Test scripts (test-scheduler.sh, TEST_SCHEDULER_INFO.txt)
- KEEP: `SCHEDULER_ENHANCEMENTS.md` (reference for job lock/retry logic)

---

## 4. **Logging & Debug Output**
### Location: `backend/src/lib/scheduler.js`

**Audit:**
- [ ] Remove debug-level logs like: `logger.debug("Job ${jobName} already running")`
- [ ] Change debug logs to trace level (if using structured logging)
- [ ] Keep info logs for job success/failure/item counts

**Before:**
```javascript
logger.debug(`Job ${jobName} already running, skipping`);
```

**After:**
```javascript
// Either remove or downgrade to trace:
// logger.trace(`Job ${jobName} already running, skipping`);
```

---

## 5. **Admin Dashboard (JobsView.vue)**
### Location: `admin/src/views/JobsView.vue`

**No changes needed!** ✅
- Job history dashboard will continue working
- Simply won't show `test-job-2min` entries after removal
- Old test entries can stay in database (harmless)

**Optional cleanup:**
- [ ] Archive/delete old test entries from `job_runs` table if desired
```sql
DELETE FROM job_runs WHERE job_name = 'test-job-2min';
```

---

## 6. **Database Migrations**
### Location: `backend/prisma/migrations/add_job_runs_tracking/`

**No removal needed!** ✅
- Migration is permanent (production-critical for job tracking)
- JobRun table schema remains unchanged
- Test entries in table are harmless

---

## 7. **Git Cleanup**
### Optional - Keep history for reference:

**Option A: Keep everything**
- [ ] No action - test code stays in git history
- Pros: Easy to enable test job again later if needed
- Cons: Slightly clutters main branch

**Option B: Rebase before merge to main**
- [ ] Create branch: `git checkout -b cleanup/remove-test-job main`
- [ ] Remove test code
- [ ] Commit: `"Remove UAT test job before production"`
- [ ] Merge to main
- Pros: Clean history
- Cons: Harder to reference test setup

**Recommendation:** Option A (simpler, reversible)

---

## 8. **Deployment Checklist**
### Before pushing to production:

- [ ] Verify `ENABLE_TEST_JOB` NOT set in Render environment
- [ ] Backend builds successfully: `npm run build` (if applicable)
- [ ] Backend starts without `ENABLE_TEST_JOB`: `npm run dev`
- [ ] Admin dashboard loads and Jobs view shows 0 test jobs
- [ ] Real jobs still run (check deactivate-expired-items, dedup-media, cleanup-tokens)
- [ ] No test-job-2min entries in database after 2 min waiting

---

## 9. **Rollback Plan**
### If issues after cleanup:

**Quick restore:**
```bash
git revert <cleanup-commit-hash>
# Re-enable ENABLE_TEST_JOB and restart
```

**Manual restore (if revert not available):**
1. Copy test job code block from previous commit
2. Paste back into scheduler.js
3. Add `ENABLE_TEST_JOB=true` to .env
4. Restart backend

---

## Timeline Estimate

| Task | Time | Stage |
|------|------|-------|
| Remove test job code | 5 min | UAT End |
| Remove test scripts/docs | 5 min | UAT End |
| Update .env files | 5 min | Before Deploy |
| Verify in staging | 10 min | Before Deploy |
| Git commit & tag | 5 min | Before Deploy |
| Deploy to production | ~5-10 min | Deploy |
| **Total** | **~40 min** | **One afternoon** |

---

## Summary Table

| Item | Remove? | Risk | Effort |
|------|---------|------|--------|
| Test job code | ✅ Yes | None (optional) | Low |
| ENABLE_TEST_JOB env | ✅ Yes | None | Low |
| Test scripts | ✅ Yes | None | Low |
| SCHEDULER_ENHANCEMENTS.md | ❌ Keep | None (reference) | N/A |
| Job locks & retry logic | ❌ Keep | CRITICAL | N/A |
| JobRun table & tracking | ❌ Keep | CRITICAL | N/A |
| Job dashboard (JobsView) | ❌ Keep | None (still useful) | N/A |

---

## Sign-Off

Once all items are checked:
- [ ] **Confirm with team** before cleanup commit
- [ ] **Tag production version** after cleanup: `git tag v1.0.0-prod`
- [ ] **Deploy to production** with confidence

✅ **No regressions expected** - test code removal is purely cosmetic
