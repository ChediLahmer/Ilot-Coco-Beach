@echo off
REM Production Cleanup Check Script (Windows)
REM Verifies all UAT/test artifacts have been removed before production deployment

setlocal enabledelayedexpansion

echo.
echo 🧹 Production Cleanup Check Script
echo ====================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Run from repository root.
    exit /b 1
)

echo 📋 Cleanup Tasks:
echo.

REM 1. Check for test job code
echo 1️⃣  Checking for test job code in scheduler...
findstr /M "ENABLE_TEST_JOB" backend\src\lib\scheduler.js >nul 2>&1
if errorlevel 1 (
    echo    ✅ Test job code already removed
) else (
    echo    ⚠️  WARNING: Test job code still present in scheduler.js
    echo    📝 To remove, edit: backend\src\lib\scheduler.js
    echo       - Delete: const enableTestJob = ...
    echo       - Delete: if (enableTestJob) { ... }
    echo.
)

REM 2. Check for ENABLE_TEST_JOB in .env files
echo 2️⃣  Checking for ENABLE_TEST_JOB in .env files...
findstr /M "ENABLE_TEST_JOB" .env .env.* >nul 2>&1
if errorlevel 1 (
    echo    ✅ ENABLE_TEST_JOB not in .env files
) else (
    echo    ⚠️  WARNING: ENABLE_TEST_JOB found in .env files
    echo    📝 Remove ENABLE_TEST_JOB= lines from:
    for %%f in (.env*) do (
        findstr "ENABLE_TEST_JOB" "%%f" >nul 2>&1
        if not errorlevel 1 echo       - %%f
    )
    echo.
)

REM 3. Check for test scripts
echo 3️⃣  Checking for test scripts...
if exist "backend\test-scheduler.sh" (
    echo    ⚠️  WARNING: backend\test-scheduler.sh exists
    echo       Remove with: del backend\test-scheduler.sh
) else (
    echo    ✅ backend\test-scheduler.sh already removed
)

if exist "backend\TEST_SCHEDULER_INFO.txt" (
    echo    ⚠️  WARNING: backend\TEST_SCHEDULER_INFO.txt exists
    echo       Remove with: del backend\TEST_SCHEDULER_INFO.txt
) else (
    echo    ✅ backend\TEST_SCHEDULER_INFO.txt already removed
)

REM 4. Check production components
echo.
echo 4️⃣  Verifying production components are intact...
findstr /M "function startScheduler" backend\src\lib\scheduler.js >nul 2>&1
if not errorlevel 1 echo    ✅ Scheduler main function present

findstr /M "jobLocks" backend\src\lib\scheduler.js >nul 2>&1
if not errorlevel 1 echo    ✅ Job lock mechanism present

findstr /M "logJobRunWithRetry" backend\src\lib\scheduler.js >nul 2>&1
if not errorlevel 1 echo    ✅ Job retry wrapper present

findstr /M "deactivate-expired-items" backend\src\lib\scheduler.js >nul 2>&1
if not errorlevel 1 echo    ✅ deactivate-expired-items job present

findstr /M "dedup-media" backend\src\lib\scheduler.js >nul 2>&1
if not errorlevel 1 echo    ✅ dedup-media job present

findstr /M "cleanup-tokens-analytics" backend\src\lib\scheduler.js >nul 2>&1
if not errorlevel 1 echo    ✅ cleanup-tokens-analytics job present

REM 5. Final status
echo.
echo 📊 Summary:
echo ===========

set test_present=0
set env_present=0
set scripts_present=0

findstr /M "ENABLE_TEST_JOB" backend\src\lib\scheduler.js >nul 2>&1 && set test_present=1
findstr /M "ENABLE_TEST_JOB" .env* >nul 2>&1 && set env_present=1
if exist "backend\test-scheduler.sh" set scripts_present=1

if "!test_present!"=="0" if "!env_present!"=="0" if "!scripts_present!"=="0" (
    echo.
    echo ✅ ✅ ✅ READY FOR PRODUCTION ✅ ✅ ✅
    echo.
    echo All UAT artifacts have been removed.
    echo You can deploy to production with confidence.
    echo.
) else (
    echo.
    echo ⚠️  UAT CLEANUP INCOMPLETE
    echo.
    echo Items still present:
    if "!test_present!"=="1" echo   - Test job code in scheduler.js
    if "!env_present!"=="1" echo   - ENABLE_TEST_JOB in .env files
    if "!scripts_present!"=="1" echo   - Test scripts in backend\
    echo.
    echo See PRODUCTION_CLEANUP_CHECKLIST.md for detailed instructions.
    echo.
)

endlocal
exit /b 0
