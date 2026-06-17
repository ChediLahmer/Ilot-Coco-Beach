#!/bin/bash
# Production Cleanup Script
# Removes all UAT/test artifacts before production deployment

set -e  # Exit on error

echo "🧹 Production Cleanup Script"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from repository root."
    exit 1
fi

echo "📋 Cleanup Tasks:"
echo ""

# 1. Check for test job code
echo "1️⃣  Checking for test job code in scheduler..."
if grep -q "ENABLE_TEST_JOB" backend/src/lib/scheduler.js 2>/dev/null; then
    echo "   ⚠️  WARNING: Test job code still present in scheduler.js"
    echo "   📝 To remove, edit: backend/src/lib/scheduler.js"
    echo "      - Delete: const enableTestJob = ..."
    echo "      - Delete: if (enableTestJob) { ... }"
    echo ""
else
    echo "   ✅ Test job code already removed"
fi

# 2. Check for ENABLE_TEST_JOB env variable
echo "2️⃣  Checking for ENABLE_TEST_JOB in .env files..."
if grep -q "ENABLE_TEST_JOB" .env* 2>/dev/null; then
    echo "   ⚠️  WARNING: ENABLE_TEST_JOB found in .env files"
    echo "   📝 To remove:"
    for file in .env*; do
        if grep -q "ENABLE_TEST_JOB" "$file" 2>/dev/null; then
            echo "      - Remove from: $file"
        fi
    done
    echo ""
else
    echo "   ✅ ENABLE_TEST_JOB not in .env files (or already removed)"
fi

# 3. Check for test scripts
echo "3️⃣  Checking for test scripts..."
if [ -f "backend/test-scheduler.sh" ]; then
    echo "   ⚠️  WARNING: backend/test-scheduler.sh exists"
    echo "      Remove with: rm backend/test-scheduler.sh"
else
    echo "   ✅ backend/test-scheduler.sh already removed"
fi

if [ -f "backend/TEST_SCHEDULER_INFO.txt" ]; then
    echo "   ⚠️  WARNING: backend/TEST_SCHEDULER_INFO.txt exists"
    echo "      Remove with: rm backend/TEST_SCHEDULER_INFO.txt"
else
    echo "   ✅ backend/TEST_SCHEDULER_INFO.txt already removed"
fi

# 4. Check job tracking still exists
echo ""
echo "4️⃣  Verifying production components are intact..."
if grep -q "function startScheduler" backend/src/lib/scheduler.js; then
    echo "   ✅ Scheduler main function present"
fi

if grep -q "jobLocks" backend/src/lib/scheduler.js; then
    echo "   ✅ Job lock mechanism present"
fi

if grep -q "logJobRunWithRetry" backend/src/lib/scheduler.js; then
    echo "   ✅ Job retry wrapper present"
fi

if grep -q "deactivate-expired-items" backend/src/lib/scheduler.js; then
    echo "   ✅ deactivate-expired-items job present"
fi

if grep -q "dedup-media" backend/src/lib/scheduler.js; then
    echo "   ✅ dedup-media job present"
fi

if grep -q "cleanup-tokens-analytics" backend/src/lib/scheduler.js; then
    echo "   ✅ cleanup-tokens-analytics job present"
fi

# 5. Summary
echo ""
echo "📊 Summary:"
echo "==========="

test_job_present=0
env_var_present=0
scripts_present=0

grep -q "ENABLE_TEST_JOB" backend/src/lib/scheduler.js 2>/dev/null && test_job_present=1
grep -q "ENABLE_TEST_JOB" .env* 2>/dev/null && env_var_present=1
[ -f "backend/test-scheduler.sh" ] && scripts_present=1

if [ $test_job_present -eq 0 ] && [ $env_var_present -eq 0 ] && [ $scripts_present -eq 0 ]; then
    echo ""
    echo "✅ ✅ ✅ READY FOR PRODUCTION ✅ ✅ ✅"
    echo ""
    echo "All UAT artifacts have been removed."
    echo "You can deploy to production with confidence."
    echo ""
else
    echo ""
    echo "⚠️  UAT CLEANUP INCOMPLETE"
    echo ""
    echo "Items still present:"
    [ $test_job_present -eq 1 ] && echo "  - Test job code in scheduler.js"
    [ $env_var_present -eq 1 ] && echo "  - ENABLE_TEST_JOB in .env files"
    [ $scripts_present -eq 1 ] && echo "  - Test scripts in backend/"
    echo ""
    echo "See PRODUCTION_CLEANUP_CHECKLIST.md for detailed instructions."
    echo ""
fi

exit 0
