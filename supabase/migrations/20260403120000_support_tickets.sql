-- Support tickets table for admin support panel
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.profiles(id) on delete set null,
  user_email text,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  admin_reply text,
  category text default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_status on public.support_tickets(status);
create index if not exists idx_support_tickets_user_id on public.support_tickets(user_id);
create index if not exists idx_support_tickets_created_at on public.support_tickets(created_at desc);

alter table public.support_tickets enable row level security;

-- Service role (used by our API) has full access
drop policy if exists "service_role_all_support_tickets" on public.support_tickets;
create policy "service_role_all_support_tickets"
  on public.support_tickets for all using (true) with check (true);
