#!/bin/bash
# Scheduler Test Script
# Enable test job (runs every 2 minutes) to verify scheduler works correctly

echo "🔧 Starting Ilot Coco Beach backend with TEST JOB enabled..."
echo "ℹ️  Test job runs every 2 minutes and logs to JobRun table"
echo "ℹ️  Check admin dashboard at: /admin -> Jobs tab"
echo "📊 You should see test-job-2min entries appearing every 2 minutes"
echo ""
echo "Press Ctrl+C to stop"
echo ""

export ENABLE_TEST_JOB=true
npm run dev
