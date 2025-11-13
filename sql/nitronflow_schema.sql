-- nitronflow_schema.sql
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  full_name text,
  role text default 'developer',
  metadata jsonb,
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact jsonb,
  notes text,
  owner_id uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  description text,
  client_id uuid references clients(id) on delete set null,
  owner_id uuid references users(id) on delete set null,
  status text default 'draft',
  github_repo text,
  supabase_project_ref text,
  supabase_db_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_owner on projects(owner_id);

create table integrations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  provider text not null,
  config jsonb,
  created_at timestamptz default now()
);

create table sprints (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text,
  start_date date,
  end_date date,
  status text default 'planned',
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  sprint_id uuid references sprints(id),
  title text not null,
  description text,
  status text default 'backlog',
  priority text default 'medium',
  estimate_hours int,
  actual_hours int default 0,
  tags text[],
  assignee_id uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table roadmap_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  title text,
  description text,
  phase text,
  target_date date,
  status text default 'pending',
  created_at timestamptz default now()
);

create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  path text,
  created_by uuid references users(id),
  metadata jsonb,
  created_at timestamptz default now()
);

create table snapshots (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text,
  storage_path text,
  commit_hash text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table deployments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  snapshot_id uuid references snapshots(id),
  environment text,
  status text default 'pending',
  logs jsonb,
  started_at timestamptz,
  finished_at timestamptz
);

create table licenses (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references clients(id),
  license_key text unique,
  status text default 'active',
  issued_at timestamptz default now(),
  expires_at timestamptz,
  price numeric(12,2)
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  license_id uuid references licenses(id),
  project_id uuid references projects(id),
  client_id uuid references clients(id),
  provider text,
  provider_reference text,
  amount numeric(12,2),
  currency text default 'BRL',
  paid_at timestamptz default now()
);

create table receipts (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid references payments(id),
  project_id uuid references projects(id),
  client_id uuid references clients(id),
  receipt_path text,
  created_at timestamptz default now()
);

create table budgets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references clients(id),
  title text,
  items jsonb,
  total numeric(12,2),
  status text default 'draft',
  issued_at timestamptz default now()
);

create table creative_sessions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  title text,
  summary text,
  metadata jsonb,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table ai_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references creative_sessions(id) on delete cascade,
  role text,
  content text,
  content_meta jsonb,
  created_at timestamptz default now()
);

create table deploy_logs (
  id uuid primary key default uuid_generate_v4(),
  deployment_id uuid references deployments(id),
  severity text,
  message text,
  meta jsonb,
  created_at timestamptz default now()
);

create table error_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  level text,
  message text,
  meta jsonb,
  created_at timestamptz default now()
);

create table telemetry_events (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  event_type text,
  payload jsonb,
  created_at timestamptz default now()
);

-- FINANCIAL / FINCORE AI TABLES
create table financial_funds (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  code text unique,
  balance numeric(16,2) default 0,
  metadata jsonb,
  created_at timestamptz default now()
);

create table financial_transactions (
  id uuid primary key default uuid_generate_v4(),
  fund_id uuid references financial_funds(id),
  project_id uuid references projects(id),
  payment_id uuid references payments(id),
  type text,
  amount numeric(16,2),
  currency text default 'BRL',
  reference text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table fincore_rules (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text,
  allocation jsonb,
  active boolean default true,
  created_at timestamptz default now()
);

create table kpi_snapshots (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  snapshot_date date,
  metrics jsonb,
  created_at timestamptz default now()
);

create table fincore_insights (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  source text,
  insight text,
  confidence numeric(5,2),
  created_at timestamptz default now()
);

-- knowledge_embeddings omitted if pgvector not enabled; store references otherwise
create table knowledge_embeddings (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  doc_ref text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- triggers
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_projects_updated_at before update on projects for each row execute function set_updated_at();
create trigger trg_tasks_updated_at before update on tasks for each row execute function set_updated_at();

-- RLS policies (básicas)
alter table projects enable row level security;
create policy project_owner_or_admin on projects
for all using (auth.role() = 'admin' or owner_id = auth.uid())
with check (auth.role() = 'admin' or owner_id = auth.uid());

alter table tasks enable row level security;
create policy task_project_member on tasks
for all using (
  exists (select 1 from projects p where p.id = tasks.project_id and (p.owner_id = auth.uid() or auth.role() = 'admin'))
)
with check (
  exists (select 1 from projects p where p.id = tasks.project_id and (p.owner_id = auth.uid() or auth.role() = 'admin'))
);

alter table financial_funds enable row level security;
create policy fund_project_owner on financial_funds
for all using (exists (select 1 from projects p where p.id = financial_funds.project_id and (p.owner_id = auth.uid() or auth.role() = 'admin')))
with check (exists (select 1 from projects p where p.id = financial_funds.project_id and (p.owner_id = auth.uid() or auth.role() = 'admin')));

alter table financial_transactions enable row level security;
create policy transactions_project_owner on financial_transactions
for all using (exists (select 1 from projects p where p.id = financial_transactions.project_id and (p.owner_id = auth.uid() or auth.role() = 'admin')))
with check (exists (select 1 from projects p where p.id = financial_transactions.project_id and (p.owner_id = auth.uid() or auth.role() = 'admin')));

-- end of nitronflow_schema.sql

