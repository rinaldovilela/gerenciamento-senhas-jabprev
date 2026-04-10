-- Test Real-time Configuration
-- Run this in Supabase Dashboard > SQL Editor to diagnose real-time issues

-- 1. Check if publication exists and has tables
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- 2. Check which tables are in the supabase_realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Check replica identity for tables
SELECT schemaname, tablename, replica_identity
FROM pg_class
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE relname IN ('tickets', 'services')
AND schemaname = 'public';

-- 4. Verify WAL is enabled
SHOW wal_level;

-- 5. Test real-time by updating a ticket manually
-- Run this and watch your app console for "⚡ EVENTO RECEBIDO"
-- Change the ID to match a ticket in your table
UPDATE public.tickets 
SET status = 'in_progress'
WHERE id = (SELECT id FROM public.tickets LIMIT 1);

-- 6. Verify the update worked
SELECT id, status, updated_at FROM public.tickets LIMIT 1;
