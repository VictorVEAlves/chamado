create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('user', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type ticket_status as enum ('pending', 'analyzing', 'in_progress', 'done');
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_priority') then
    create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'department') then
    create type department as enum ('comercial', 'marketing', 'comex', 'compras', 'financeiro', 'logistica', 'ti', 'rh', 'diretoria');
  end if;
end
$$;

create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  name text not null,
  role user_role default 'user',
  department department not null,
  avatar_url text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  status ticket_status default 'pending',
  priority ticket_priority default 'medium',
  department department not null,
  created_by uuid references profiles(id) not null,
  assigned_to uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ticket_comments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);

create table if not exists ticket_history (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  changed_by uuid references profiles(id),
  old_status ticket_status,
  new_status ticket_status not null,
  created_at timestamptz default now()
);

create table if not exists ticket_attachments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  ticket_id uuid references tickets(id) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create or replace function public.set_ticket_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
before update on public.tickets
for each row
execute function public.set_ticket_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create or replace function public.can_access_ticket(target_ticket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tickets t
    left join public.profiles p
      on p.id = auth.uid()
    where t.id = target_ticket_id
      and (
        public.is_admin()
        or t.created_by = auth.uid()
        or (p.active = true and p.department = t.department)
      )
  );
$$;

create or replace function public.lock_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    new.role = old.role;
    new.active = old.active;
    new.department = old.department;
    new.id = old.id;
    new.created_at = old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_lock_fields on public.profiles;
create trigger profiles_lock_fields
before update on public.profiles
for each row
execute function public.lock_profile_fields();

create or replace function public.get_department_open_counts()
returns table (department department, open_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    dep.department,
    coalesce(count(t.id), 0) as open_count
  from unnest(enum_range(null::department)) as dep(department)
  left join public.tickets t
    on t.department = dep.department
   and t.status <> 'done'
  group by dep.department
  order by dep.department::text;
$$;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_access_ticket(uuid) to authenticated;
grant execute on function public.get_department_open_counts() to authenticated;

alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.ticket_history enable row level security;
alter table public.ticket_attachments enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "tickets_select_department_or_creator_or_admin" on public.tickets;
create policy "tickets_select_department_or_creator_or_admin"
on public.tickets
for select
using (
  public.is_admin()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.department = tickets.department
  )
);

drop policy if exists "tickets_insert_authenticated" on public.tickets;
create policy "tickets_insert_authenticated"
on public.tickets
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
  )
);

drop policy if exists "ticket_comments_select_by_ticket_access" on public.ticket_comments;
create policy "ticket_comments_select_by_ticket_access"
on public.ticket_comments
for select
using (public.can_access_ticket(ticket_id));

drop policy if exists "ticket_comments_insert_by_ticket_access" on public.ticket_comments;
create policy "ticket_comments_insert_by_ticket_access"
on public.ticket_comments
for insert
with check (
  user_id = auth.uid()
  and public.can_access_ticket(ticket_id)
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
  )
);

drop policy if exists "ticket_history_select_by_ticket_access" on public.ticket_history;
create policy "ticket_history_select_by_ticket_access"
on public.ticket_history
for select
using (public.can_access_ticket(ticket_id));

drop policy if exists "ticket_attachments_select_by_ticket_access" on public.ticket_attachments;
create policy "ticket_attachments_select_by_ticket_access"
on public.ticket_attachments
for select
using (public.can_access_ticket(ticket_id));

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('ticket-attachments', 'ticket-attachments', false)
on conflict (id) do update
set public = excluded.public;
