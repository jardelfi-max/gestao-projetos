-- ==========================================================================
-- Gestão de Projetos — Fase S2: tabelas de cadastros (dados em JSONB)
-- Rode este script no Supabase: Dashboard → SQL Editor → New query → Run.
-- ==========================================================================

create table if not exists public.pessoas (
  id bigint generated always as identity primary key,
  dados jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.centros (
  id bigint generated always as identity primary key,
  dados jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.tipos (
  id bigint generated always as identity primary key,
  dados jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  dados jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Segurança (RLS): liga a proteção e permite acesso total a usuários logados.
-- (Refinamos as permissões por perfil/projeto nas próximas fases.)
alter table public.pessoas enable row level security;
alter table public.centros enable row level security;
alter table public.tipos enable row level security;
alter table public.categorias enable row level security;

drop policy if exists "auth_all" on public.pessoas;
drop policy if exists "auth_all" on public.centros;
drop policy if exists "auth_all" on public.tipos;
drop policy if exists "auth_all" on public.categorias;

create policy "auth_all" on public.pessoas for all to authenticated using (true) with check (true);
create policy "auth_all" on public.centros for all to authenticated using (true) with check (true);
create policy "auth_all" on public.tipos for all to authenticated using (true) with check (true);
create policy "auth_all" on public.categorias for all to authenticated using (true) with check (true);
