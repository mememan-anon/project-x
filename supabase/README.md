# Supabase Schema

Run the SQL in `supabase/schema.sql` inside your Supabase SQL editor.

Notes:
- This schema is single-user (no auth). The app stores a local `user_id` (UUID) and writes rows with that `user_id`.
- `project_detail_clicks` logs clicks to project detail links (and any apply links).
- `page_views` logs page opens (we log the Home page now).
- `page_views` now also stores `url_path`, `user_agent`, and `ip_address`.

## Edge Function: log_page_view
To capture IPs, deploy the edge function:
- `supabase/functions/log_page_view/index.ts`
- Requires env vars in Supabase:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
