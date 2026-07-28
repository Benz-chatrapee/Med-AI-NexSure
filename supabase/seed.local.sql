-- Local Supabase reset seed entrypoint.
-- This configured prelude resolves the Local/Demo fixture guard before the
-- guarded seed.sql file runs during `supabase db reset --local`.

set app.seed_environment = 'local';
