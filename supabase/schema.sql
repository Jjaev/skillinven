create table if not exists public.skills (
  source_id text primary key,
  public_id text not null unique,
  name text not null,
  name_ko text,
  description_en text not null,
  description_ko text,
  is_reviewed boolean not null default false,
  github_url text not null,
  source_repo text not null,
  source_path text not null,
  author text not null,
  stars integer,
  compatible_with text[] not null default '{}',
  category text,
  updated_at timestamptz not null default now()
);

alter table public.skills enable row level security;

create policy "public read skills"
on public.skills
for select
to anon, authenticated
using (true);

create policy "service role manages skills"
on public.skills
for all
to service_role
using (true)
with check (true);
