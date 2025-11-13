# NITRONFLOW DEV

> Documento único e executável. Contém: visão do sistema, stack, telas com UX detalhado, fluxos, rotas/contratos de API, Edge Functions, roadmap (criação de projetos passo a passo), checklist QA de desenvolvedor (tela por tela / endpoint por endpoint / arquivo por arquivo), instrução para gerar documentação e arquivo SQL `nitronflow_schema.sql` pronto para copiar e colar no Supabase SQL Editor.

---

## 1 — RESUMO EXECUTIVO

NitronFlow Dev é uma plataforma pessoal de desenvolvimento e gestão (PT-BR) que reúne: editor online (VSCode Web/code-server), sincronização com editor local (Cursor/VSCode), GitHub, gerenciamento de clientes/projetos/tarefas/roadmap, integração Lovable-like com Supabase (criar/conectar DB por projeto), licenças e monetização (integração Kiwify), módulo financeiro inteligente FINCORE AI (distribuição automática de receitas, KPIs, insights via DeepSeek), ambiente de criação/storytelling (chat + voz), orquestração de deploys e debug remoto. Backend persistente: Supabase (Postgres + Auth + Storage + Edge Functions). Frontend: Next.js + TypeScript + Tailwind + shadcn UI. Idioma: PT-BR. Tema: claro/escuro, estilo minimal (Lovable/Linear).

---

## 2 — STACK TÉCNICO PRINCIPAL

* Frontend: Next.js + TypeScript + Tailwind CSS + shadcn UI + Framer Motion (animações leves)
* Backend persistente: Supabase (Postgres + Auth + Storage + Edge Functions JS/TS)
* Editor online: code-server (VSCode Web) embutido via iframe apontando a workspaces no Supabase Storage
* Sincronização local: daemon / VSCode extension que envia patches via Webhook/Edge Function (`/workspace/:id/patch`)
* Integrations: GitHub OAuth, Supabase Management API (service_role), Kiwify API, OpenAI/DeepSeek, Whisper/Deepgram, Stripe/Asaas (opcionais)
* FINCORE AI: microserviço Python (FastAPI) ou Node para cálculos e orquestração financeira + Vector DB para RAG (Pinecone/Milvus)
* CI/CD / Runner: GitHub Actions + runner (Render/Fly/K8s) para builds/deploys/debug
* Observabilidade: Sentry + Grafana + logging em tabelas (`deploy_logs`, `error_logs`, `telemetry_events`)

---

## 3 — REGRAS GERAIS DE IMPLEMENTAÇÃO

* Arquivo mestre do schema: `nitronflow_schema.sql`. TODO ajuste de DB deve atualizar esse arquivo e comitar.
* Edge Functions: responder `{ ok: boolean, data?: any, error?: string }`. Validar `Authorization: Bearer <supabase_jwt>`. Usar `service_role` apenas server-side em funções de criação de child projects.
* Buckets storage a criar: `workspaces`, `snapshots`, `receipts`, `ai-uploads`, `backups`.
* Secrets: setar nas Environment Variables do projeto Supabase (`SERVICE_ROLE_KEY`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `DEEPSEEK_API_KEY`, `KIWIFY_API_KEY`, `FYNC_CORE_SECRET`).
* RLS (Row Level Security) ativo nas tabelas sensíveis conforme schema.

---

## 4 — TELA A TELA (UX/UI DETALHADO — PT-BR)

### 4.1 Tela: Login

**Objetivo:** autenticar usuário.
**Componentes:** logo, campos email/senha, botão Entrar, botão Entrar com GitHub, link Esqueci senha, 2FA modal opcional.
**Ações:** enviar credenciais → Supabase Auth; OAuth GitHub redireciona → callback → criar sessão.
**Validações:** campos obrigatórios, formato email, tratamento erros de rede.
**Endpoints:** Supabase Auth (client).
**Critérios QA:** redirecionamento, mensagens de erro, persistência de sessão.

---

### 4.2 Tela: Dashboard (Home)

**Objetivo:** visão rápida do ecossistema.
**Componentes:** header (busca global, avatar, tema), cards (Projetos Ativos, Próximos Prazos, Licenças Ativas, Receita Total, Saldo Fundos FINCORE), gráfico de receita, feed de atividades, botão Novo Projeto.
**Ações:** clicar card abre detalhe; quick actions (Commit, Deploy); ver recomendações FINCORE.
**Endpoints:** `GET /projects/summary`, `GET /finance/summary`, `GET /fincore/insights`.
**Critérios QA:** cards mostram dados reais; gráficos interativos; tema toggle funcional; responsividade.

---

### 4.3 Tela: Menu Lateral

**Itens:** Dashboard, Clientes, Projetos, Tarefas, Workspace (Editor), Banco de Dados, Minhas Versões Finais, FINANCEIRO (FINCORE), Orçamentos, Recibos, IA, Configurações, Logout.
**UX:** fixo, colapsável em mobile, highlight no item ativo.
**Critérios QA:** navegação estável, estados ativos corretos.

---

### 4.4 Tela: Clientes (lista & detalhe)

**Lista:** grid de cards (nome, contato, total projetos, ações).
**Detalhe:** perfil do cliente, projetos vinculados, histórico financeiro, orçamentos, recibos.
**Endpoints:** `GET/POST/PUT/DELETE /clients`.
**Validations:** campo nome obrigatório.
**QA:** CRUD completo, upload de contato funcionando, links para projetos.

---

### 4.5 Tela: Projetos (lista & detalhe)

**Lista:** filtros (status, cliente, receita), cards com status, versão, licenças, receita.
**Criar Projeto (modal):** campos: nome, cliente, descrição, stack, criar workspace (checkbox), criar Supabase DB child (checkbox).
**Detalhe projeto:** resumo, roadmap (timeline), sprints, tarefas, integrações (GitHub, Supabase), snapshots, deploys; ações 1-click: Abrir Ambiente, Conectar GitHub, Conectar Supabase, Criar Snapshot, Commit & Push, Deploy Staging/Prod.
**Endpoints:** `GET/POST/PUT/DELETE /projects`, `POST /projects/:id/init-roadmap`.
**QA:** criação com opções; workspace e roadmap init criados quando selecionado; campos `supabase_project_ref` / `supabase_db_url` populados.

---

### 4.6 Tela: Tarefas / Kanban

**Board:** colunas Backlog / Em andamento / Revisão / Concluído; drag & drop; card com título, prioridade, tags, estimation, assignee.
**Ações:** criar, editar, mover, atribuir.
**Endpoints:** `GET/POST/PUT/DELETE /tasks`, `POST /tasks/move`.
**QA:** persistência após refresh; cálculo de progresso da sprint; histórico de mudanças.

---

### 4.7 Tela: Roadmap

**Visual:** timeline horizontal, milestones, percent complete, editar inline.
**Ações:** criar milestone, vincular tasks, reordenar.
**Endpoints:** `GET/POST/PUT/DELETE /roadmap_items`.
**QA:** vinculação com tasks visível e consistente.

---

### 4.8 Tela: Workspace (Editor)

**Componentes:** iframe code-server; painel lateral DB; snapshots list; terminal embutido; toolbar superior (Commit, Push, Snapshot, Conectar Supabase, Abrir no Cursor, Iniciar Debug).
**Fluxo:** salvar local -> daemon envia patch -> `POST /workspace/:id/patch` -> salva em bucket `workspaces/{workspaceId}/{path}` -> code-server reflete.
**Endpoints:** `POST /workspace/:id/patch`, `POST /workspace/:id/snapshot`, `POST /workspace/:id/commit`, `POST /supabase/connect`.
**QA:** arquivos sincronizam, snapshots listáveis, `.env` injetado e uso efetivo.

---

### 4.9 Tela: Banco de Dados (dentro do Editor)

**Componentes:** lista de conexões, botão Conectar Novo Banco (modal Lovable-style), botão Criar novo DB (via Management API), query editor, view de tabelas.
**Modal Conectar:** modo OAuth (list projects) ou URL+Anon Key paste. Teste `SELECT now()` antes de confirmar.
**Endpoints:** `POST /supabase/connect`, `GET /supabase/projects`, `DELETE /supabase/:ref`.
**QA:** conexão e criação automáticas, chaves criptografadas, query editor funcional.

---

### 4.10 Tela: Minhas Versões Finais

**Objetivo:** visão das versões em produção e impacto financeiro.
**Componentes:** tabela (produto, versão, licenças vendidas, ativas, valor unitário, receita acumulada), gráficos, botões Exportar, Sincronizar Kiwify, Detalhes.
**Endpoints:** `GET /finance/products`, `POST /finance/sync-kiwify`.
**QA:** números batem com Kiwify, export CSV correta.

---

### 4.11 Tela: FINANCEIRO (FINCORE AI)

**Painel:** Saldo Total; Saldo por Fundo (Reinvestimento, Marketing, Reserva, Inovação, Pro Labore, Investimentos); cards KPI (ROI, LTV, CAC, Runway); cards educativos (frente/verso com explicação DeepSeek); alocação visual; simulate scenario widget; botão aplicar recomendação IA; histórico transações.
**Ações:** configurar regra de alocação padrão (`fincore_rules`), executar `POST /fincore/distribute` ao receber pagamento, ver `fincore_insights`.
**Endpoints:** `GET /fincore/summary`, `POST /fincore/distribute`, `POST /fincore/simulate`, `GET /fincore/insights`.
**QA:** distribuição automática cria `financial_transactions`, `financial_funds` balance atualizável, reversibilidade e log auditável, KPIs atualizam.

---

### 4.12 Tela: Orçamentos

**Criar Orçamento:** items JSON (desc, qty, unit, total), validade, enviar por email.
**Endpoints:** `POST /budgets`, `GET /budgets`, `POST /budgets/:id/send`.
**QA:** PDF gerado e salvo no bucket `receipts`, link temporário válido.

---

### 4.13 Tela: Recibos

**Lista e Visualização:** recibos vinculados a pagamentos; download PDF; reenvio por email.
**Endpoints:** `GET /receipts`, `POST /receipts/send`.
**QA:** número sequencial, dados conferem com pagamento.

---

### 4.14 Tela: IA — Ambiente de Criação e Storytelling

**Componentes:** chat UI, gravação de voz, transcrição, TTS, histórico de sessões, botão "Transformar em Roadmap", "Criar Tarefas".
**Endpoints:** `POST /ai/chat`, `POST /ai/stt`, `POST /creative_sessions`.
**QA:** mensagens armazenadas em `ai_messages`; STT e TTS integrados; geração de tarefas/roadmap cria registros correspondentes.

---

### 4.15 Tela: Configurações

**Itens:** integrações (GitHub, Kiwify), variáveis por projeto, roles/permissions, tema, backup schedule.
**Endpoints:** `GET/POST /integrations`, `GET/POST /settings`.
**QA:** OAuth flows funcionais, tokens criptografados, variáveis aplicadas ao workspace.

---

## 5 — ROTAS / API CONTRACT (Resumo)

Formato resposta: `{ ok: boolean, data?: any, error?: string }`. Autenticação: Supabase JWT.

**Projects**

* `GET /projects`
* `POST /projects` { name, client_id, description, createWorkspace, createSupabase }
* `PUT /projects/:id`
* `DELETE /projects/:id`
* `POST /projects/:id/init-roadmap`

**Clients**

* `GET/POST/PUT/DELETE /clients`

**Tasks**

* `GET /tasks?projectId=`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`, `POST /tasks/move` { id, status, sprintId }

**Workspace**

* `POST /workspace/:id/patch` { path, content, commitOnSave }
* `POST /workspace/:id/snapshot`
* `POST /workspace/:id/commit` { message }

**GitHub**

* `GET /github/repos`
* `POST /github/connect`
* `POST /github/commit-push` { workspaceId, message }

**Supabase Management (Lovable-like)**

* `POST /supabase/connect` { authType, email?, password?, projectName?, projectRef? }
* `GET /supabase/projects`
* `DELETE /supabase/:projectRef`

**Deploy**

* `POST /deploy` { projectId, snapshotId, environment }
* `POST /deploy/debug` { projectId, snapshotId }

**Finance / FINCORE**

* `POST /finance/sync-kiwify` { since? }
* `GET /finance/products`
* `GET /fincore/summary`
* `POST /fincore/distribute` { paymentId, allocationPlan? }
* `POST /fincore/simulate` { scenario }
* `GET /fincore/insights`

**AI**

* `POST /ai/chat` { sessionId?, message }
* `POST /ai/stt` (multipart)
* `GET/POST /creative_sessions`

**Backup & Logs**

* `POST /backup/run`
* `GET /logs/deploy/:id`

---

## 6 — EDGE FUNCTIONS (lista mínima a implementar com contrato)

* `projects/get` — lista projetos do user
* `projects/create` — criar projeto (gera roadmap, workspace, opcional supabase child)
* `projects/init-roadmap` — criar sprints & roadmap_items padrão
* `clients/*` — CRUD clients
* `tasks/*` — CRUD tasks + move
* `workspace/patch` — receber patch, validar path, salvar em bucket, grava telemetry, opcional commitOnSave
* `workspace/snapshot` — zip workspace e salvar em bucket `snapshots` e criar registro
* `workspace/commit` — realizar server-side git commit & push usando integração GitHub (token)
* `github/connect` — OAuth flow and save token encrypted in `integrations`
* `github/repos` — listar repos via token
* `supabase/connect` — Lovable-like connect/create child project (service_role) e return keys
* `supabase/list` — listar projetos do user (via token)
* `deploy/start` — trigger external runner webhook for build/deploy
* `deploy/debug` — start debug container and return tunnel info
* `finance/sync-kiwify` — fetch sales and map to `payments`/`licenses`
* `fincore/distribute` — apply allocation plan and create `financial_transactions`
* `fincore/summary` — return balance per fund and KPIs (calls FINCORE microservice)
* `ai/chat` — proxy to DeepSeek/OpenAI and store ai_messages
* `ai/stt` — accept audio, store to `ai-uploads`, call STT, store transcript
* `backup/run` — zip schema & snapshots to `backups`

---

## 7 — ROADMAP: CRIAÇÃO E FLUXO DE UM PROJETO (passo a passo para usuário)

1. **Novo Projeto (UI)** → Preencher nome, cliente, descrição, escolher criar workspace e criar DB child.
2. **Backend** → `POST /projects` cria registro; se createWorkspace true → criar workspace record, provisionar storage path; se createSupabase true → chamar `POST /projects/:id/init-roadmap` depois de `supabase/connect` criar child DB.
3. **Init Roadmap** → Edge Function cria sprints padrão (ex: Sprint 1 Setup, Sprint 2 Core, Sprint 3 QA, Sprint 4 Release) + roadmap items.
4. **Provision Workspace** → criar pasta no bucket `workspaces/{workspaceId}/` e copiar template boilerplate (template project).
5. **Abrir Ambiente** → botão abre code-server iframe apontando para `workspaces/{workspaceId}`.
6. **Desenvolver Localmente** → usuario local (Cursor) edita; daemon envia patches `POST /workspace/:id/patch` e cria snapshots periodicamente.
7. **Commit & Push** → botão Commit no painel chama `POST /workspace/:id/commit` (server-side git workflow) → push para GitHub (usando token em `integrations`).
8. **Build & Deploy Preview** → `POST /deploy` cria build via runner → preview URL mostrado; logs gravados em `deploy_logs`.
9. **QA & Debug** → `POST /deploy/debug` cria container com debug flag; VSCode attach via tunnel; logs ao vivo.
10. **Go Live** → `POST /deploy` ambiente production. Registrar deployment em `deployments`.
11. **Financeiro** → vendas importadas via Kiwify ou registradas → `POST /finance/sync-kiwify` populates `payments` & `licenses` → `POST /fincore/distribute` aplica alocação automática e cria `financial_transactions`.
12. **Manutenção** → snapshots, backups, métricas, e criação de orçamentos/recibos.

---

## 8 — ESTRUTURA DE ARTEFATOS E PASTAS (detalhado)

```
/nitronflow-dev
  /frontend
    /components
      /layout
      /cards
      /forms
      /modals
      /kanban
      /editor
    /pages
      /dashboard
      /clients
      /projects
      /project/[id]
      /workspace/[id]
      /finance
      /fincore
      /ai
      /auth
    /lib
      supabase.ts
      api.ts
    /styles
    /hooks
  /backend
    /edge-functions
      /projects
      /clients
      /tasks
      /workspace
      /git
      /supabase
      /deploy
      /finance
      /fincore
      /ai
      /backup
    /fincore-service (FastAPI)
  /infra
    /code-server
    /runner
  /scripts
    daemon_watcher.js
    deploy-stager.sh
    create-supabase-project.sh
  /docs
    readme_setup.md
    api_reference.md
    ui_specs.md
    qa_checklist.md
  /sql
    nitronflow_schema.sql
```

---

## 9 — DOCUMENTAÇÃO (instrução para criação)

* Gerar automaticamente (Cursor/IA) os seguintes documentos em `/docs`:

  * `readme_setup.md` (passo-a-passo para executar local e produção)
  * `api_reference.md` (endpoints, payloads, exemplos)
  * `ui_specs.md` (tela por tela: layout, componentes, states, acessibilidade)
  * `db_er_diagram.png` (ER diagram gerado a partir do schema)
  * `edge_functions.md` (código skeleton de cada function + testes)
  * `postman_collection.json` (collection completa)
  * `qa_checklist.md` (toda a seção QA exportada)
* Regras: documentação em PT-BR, exemplos reais de payloads, instruções de segurança, como rotacionar `SERVICE_ROLE_KEY`.

---

## 10 — QA CHECKLIST (DEVELOPER TESTS) — TELA POR TELA, ENDPOINT POR ENDPOINT, ARQUIVOS

> Cada item: AÇÃO -> RESULTADO ESPERADO -> ARQUIVOS/ENDPOINTS A VALIDAR

### Geral

* Ação: executar `nitronflow_schema.sql` → Resultado: todas tabelas e policies criadas sem erro. Arquivo: `sql/nitronflow_schema.sql`.

### Login

* Teste: login email/senha → OK e redireciona. Arquivos: `frontend/pages/auth`, Supabase Auth.
* Teste: OAuth GitHub flow → token salvo em `integrations`. Endpoint: `github/connect`.

### Dashboard

* Teste: visualizar cards com números reais (usar dados de teste) → valores corretos. Endpoints: `GET /projects/summary`, `GET /finance/summary`.

### Clientes

* Teste: POST /clients cria registro → GET shows record. Endpoints: `/clients`; DB: `clients`.

### Projetos

* Teste: criar projeto com createWorkspace true → workspace folder criado em bucket `workspaces`, registro em `workspaces`. Endpoints: `POST /projects`.
* Teste: criar projeto com createSupabase true → `supabase/connect` chamado e `projects.supabase_project_ref` preenchido. Endpoints: `POST /supabase/connect`, `POST /projects`.

### Roadmap & Sprints

* Teste: `POST /projects/:id/init-roadmap` cria sprints and roadmap_items. DB: `sprints`, `roadmap_items`. UI: roadmap page.

### Tarefas & Kanban

* Teste: criar task, mover column (drag & drop) → status persisted. Endpoints: `/tasks`, `/tasks/move`. DB: `tasks`.

### Workspace Sync

* Teste: salvar arquivo local -> daemon sends patch -> file appears in `workspaces/{id}` bucket -> code-server shows file. Endpoints: `/workspace/:id/patch`. Files: `scripts/daemon_watcher.js`.

### Snapshots

* Teste: `POST /workspace/:id/snapshot` -> zip created and stored in `snapshots` bucket and record in `snapshots` table. Endpoint: `/workspace/:id/snapshot`.

### Commit & Push

* Teste: `POST /workspace/:id/commit` performs git commit and push -> verify commit in GitHub repo. Endpoint: `/workspace/:id/commit`, integration `integrations` provider: github.

### Editor (code-server)

* Teste: open iframe loads editor, files editable, terminal works. Infra: `infra/code-server`.

### Supabase Connect (Lovable)

* Teste: Modal connect via URL+Anon key -> `SELECT now()` successful.
* Teste: OAuth -> list user projects -> create project via service_role -> returned `supabase_db_url` and keys. Endpoints: `/supabase/connect`, `/supabase/projects`. DB: `integrations`.

### Database Query Editor

* Teste: run SELECT on connected DB and return results. Ensure keys not exposed in frontend logs.

### Deploy & Debug

* Teste: `POST /deploy` triggers runner, preview URL returned, `deployments` record updated. Endpoint: `/deploy`.
* Teste: `POST /deploy/debug` returns tunnel info and VSCode attach works. DB: `deployments`, `deploy_logs`.

### Finance / Kiwify

* Teste: `POST /finance/sync-kiwify` fetch sales -> create `payments` and `licenses`. Endpoints: `/finance/sync-kiwify`. DB: `payments`, `licenses`.
* Teste: `POST /fincore/distribute` -> creates `financial_transactions`, updates `financial_funds`. DB: `financial_funds`, `financial_transactions`.
* Teste: `GET /fincore/summary` returns balances & KPIs.

### Orçamentos / Recibos

* Teste: create budget -> generate PDF -> saved in `receipts` bucket -> record in `budgets`. Endpoint: `/budgets`, `/receipts/generate`.

### IA / Creative Sessions

* Teste: `POST /ai/chat` stores ai_message; `POST /ai/stt` saves file and transcript. DB: `creative_sessions`, `ai_messages`. Bucket: `ai-uploads`.

### Backups & Logs

* Teste: `POST /backup/run` -> backup created in `backups` bucket. Endpoint: `/backup/run`.

### Security & RLS

* Teste: user A cannot view projects of user B. Policy checks on `projects`, `tasks`, `financial_funds`, `financial_transactions`.

### Performance

* Teste: simulate 50 concurrent `workspace/:id/patch` calls -> system enqueues/limits; no data loss; monitor telemetry. Endpoint: `/workspace/:id/patch`.

### Docs & Delivery

* Teste: existence of `/docs` files: `edge_functions.md`, `api_reference.md`, `ui_specs.md`, `postman_collection.json`, `readme_setup.md`, `qa_checklist.md`.

---

## 11 — ORIENTAÇÃO & PROMPT PARA EXECUTAR NO SUPABASE (arquivo de instruções para colar no Cursor/Executor)

Copiar/colar exatamente no Cursor/IA para executar criação do banco e steps iniciais.

```
Ação 1: Execute o arquivo SQL abaixo (nitronflow_schema.sql) no Supabase SQL Editor do projeto alvo. Confirme que todas as tabelas, índices, triggers e policies foram criados sem erro.

Ação 2: Crie os buckets no Storage: workspaces, snapshots, receipts, ai-uploads, backups.

Ação 3: Configure as Environment Variables no projeto Supabase:
  SERVICE_ROLE_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DEEPSEEK_API_KEY, KIWIFY_API_KEY, FYNC_CORE_SECRET.

Ação 4: Implemente as Edge Functions conforme a lista no documento principal. Cada função deve:
  - Validar auth (Supabase Bearer).
  - Usar service_role quando necessário para Management API.
  - Registrar telemetria em telemetry_events / deploy_logs.
  - Retornar JSON { ok, data?, error? }.

Ação 5: Gerar os artefatos em /docs e commitar no repositório GitHub.

Obs: Sempre que alterar schema, atualize o arquivo nitronflow_schema.sql e re-execute na instancia de desenvolvimento.
```

---

## 12 — ARQUIVO SQL PARA CRIAR O BANCO (COPIAR/COLE NO SUPABASE SQL EDITOR)

Salve como `nitronflow_schema.sql` e execute.

```sql
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
```

---

## 13 — CHECKLIST DE ENTREGA (O QUE A IA/DEVELOPER DEVE GERAR)

* `nitronflow_schema.sql` (executado e versionado)
* Buckets criados: `workspaces`, `snapshots`, `receipts`, `ai-uploads`, `backups`
* Edge Functions implementadas e testadas (lista completa)
* Frontend scaffold com todas telas e componentes (Next.js)
* `daemon_watcher.js` pronto e documentado
* `fincore-service` (microserviço) com endpoints e testes unitários
* Postman collection ou tests automatizados para todas rotas
* Documentação gerada: `readme_setup.md`, `api_reference.md`, `ui_specs.md`, `qa_checklist.md`, ER diagram
* QA checklist executado e status report

---

## 14 — ORIENTAÇÃO FINAL PARA O CURSOR / AGENTE

1. Execute `nitronflow_schema.sql` no Supabase SQL Editor.
2. Crie buckets Storage listados.
3. Configure ENV vars no Supabase Project Settings.
4. Implemente Edge Functions conforme contratos; teste cada uma via Postman.
5. Gere frontend scaffold Next.js com telas conforme seção 4 (toda UI, theme toggle, responsiveness).
6. Provisione code-server e configure workspaces para apontar para `workspaces` bucket.
7. Implemente `daemon_watcher.js` para envio on-save.
8. Implemente microserviço FINCORE com endpoints: `/fincore/summary`, `/fincore/distribute`, `/fincore/simulate`, `/fincore/insights`.
9. Integre Kiwify sync e mapeie `payments`/`licenses`.
10. Geração de documentação completa em `/docs` automaticamente.
11. Execute QA Checklist e gere `qa_report.md` com resultados.
12. Atualize `nitronflow_schema.sql` caso haja mudanças no schema durante a implementação.

---

## 15 — ENTREGA IMEDIATA (arquivos que você irá copiar daqui)

* Copie o bloco SQL (página anterior) e cole no Supabase SQL Editor para criar o banco.
* Use a seção **ORIENTAÇÃO & PROMPT PARA EXECUTAR NO SUPABASE** (item 11) como prompt direto para o Cursor/Agente.
* Use o QA Checklist (item 10) para validar implementação tela a tela, endpoint a endpoint e arquivo a arquivo.

---

FIM.

