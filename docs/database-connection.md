# Database Connection

## Requirement

Connect Med AI NexSure to Supabase without storing secrets in source code.

## Architecture

- `lib/database/env.ts` reads server environment variables.
- `lib/database/supabase-rest.ts` performs a server-side Supabase REST health check.
- `services/database-service.ts` exposes the database service boundary.
- `app/api/database/health/route.ts` returns a sanitized database health response.
- `components/features/auth/database-status.tsx` displays the connection state on the login page.

## Environment Variables

Create a local `.env.local` file. Do not commit it.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security

- No service role key is used in the frontend.
- No API keys are printed in UI responses.
- Connection errors are sanitized.

## Testing

Run:

```bash
npm run build
```

Then open:

```text
http://localhost:3000/api/database/health
```
