create table if not exists "public"."mailing_list" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "source" text default 'web',
    "created_at" timestamp with time zone default now(),
    constraint "mailing_list_pkey" primary key ("id"),
    constraint "mailing_list_email_key" unique ("email")
);

alter table "public"."mailing_list" enable row level security;

-- Allow public to insert (subscribe)
create policy "Enable insert for public" on "public"."mailing_list"
as permissive for insert
to public
with check (true);

-- Allow admins (service role) to view all
create policy "Enable read for service role only" on "public"."mailing_list"
as permissive for select
to service_role
using (true);
