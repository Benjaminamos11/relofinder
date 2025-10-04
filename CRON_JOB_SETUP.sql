-- =====================================================
-- CRON JOB SETUP FOR GOOGLE REVIEWS SYNC
-- =====================================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yrkdgsswjnrrprfsmllr/sql/new

-- Step 1: Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Schedule Google reviews sync every 10 days at 3 AM UTC
SELECT cron.schedule(
  'sync-google-reviews',                  -- Job name
  '0 3 */10 * *',                        -- Cron expression: 3 AM every 10 days
  $$
  SELECT
    net.http_post(
      url:='https://yrkdgsswjnrrprfsmllr.supabase.co/functions/v1/sync-google-reviews',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if the cron job was created successfully
SELECT * FROM cron.job;

-- View cron job execution history
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- =====================================================
-- MANUAL TRIGGER (FOR TESTING)
-- =====================================================
-- If you want to test the sync immediately, run:
SELECT cron.unschedule('sync-google-reviews');  -- Remove if exists
SELECT net.http_post(
  url:='https://yrkdgsswjnrrprfsmllr.supabase.co/functions/v1/sync-google-reviews',
  headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2Rnc3N3am5ycnByZnNtbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU4MzIsImV4cCI6MjA1MTQ5MTgzMn0.7BlX7lS9eOesqW7TAAAAKlc068Ria-7rCjOwvaywctE"}'::jsonb,
  body:='{}'::jsonb
) AS request_id;

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you need to delete the cron job:
-- SELECT cron.unschedule('sync-google-reviews');

-- If you need to reschedule with different timing:
-- SELECT cron.unschedule('sync-google-reviews');
-- Then run the schedule command again with new timing

