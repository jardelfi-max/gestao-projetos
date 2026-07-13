-- ==========================================================================
-- Gestão de Projetos — Fase S3: tabela de projetos (projeto inteiro em JSONB,
-- incluindo previsto/realizado/transferências/tarefas/envolvidos).
-- Rode no Supabase: SQL Editor → New query → cole → Run.
-- ==========================================================================

create table if not exists public.projetos (
  id bigint generated always as identity primary key,
  dados jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.projetos enable row level security;

drop policy if exists "auth_all" on public.projetos;
create policy "auth_all" on public.projetos for all to authenticated using (true) with check (true);
