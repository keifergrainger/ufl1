
alter table "public"."analytics_events"
add column "session_id" text,
add column "visitor_id" text;

-- Add index for performance on aggregations
create index "analytics_events_visitor_id_idx" on "public"."analytics_events" ("visitor_id");
create index "analytics_events_session_id_idx" on "public"."analytics_events" ("session_id");
