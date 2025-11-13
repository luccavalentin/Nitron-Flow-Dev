# API Reference - NitronFlow Dev

Documentação completa de todos os endpoints da API.

## Formato de Resposta

Todas as respostas seguem o formato:

```json
{
  "ok": boolean,
  "data"?: any,
  "error"?: string
}
```

## Autenticação

Todas as requisições (exceto login) requerem header:

```
Authorization: Bearer <supabase_jwt_token>
```

---

## Projects

### GET /projects

Lista todos os projetos do usuário autenticado.

**Resposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "description": "string",
      "client_id": "uuid",
      "status": "draft|active|completed",
      "github_repo": "string",
      "supabase_project_ref": "string",
      "supabase_db_url": "string",
      "created_at": "timestamp"
    }
  ]
}
```

### GET /projects/get-by-id?id={id}

Busca um projeto específico por ID.

**Parâmetros:**
- `id` (query): UUID do projeto

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "string",
    // ... outros campos
  }
}
```

### POST /projects

Cria um novo projeto.

**Body:**
```json
{
  "name": "string (obrigatório)",
  "client_id": "uuid (opcional)",
  "description": "string (opcional)",
  "createWorkspace": boolean,
  "createSupabase": boolean
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "string",
    // ... projeto criado
  }
}
```

### PUT /projects/:id

Atualiza um projeto existente.

**Body:**
```json
{
  "name": "string",
  "description": "string",
  "status": "draft|active|completed"
}
```

### DELETE /projects/:id

Deleta um projeto.

**Resposta:**
```json
{
  "ok": true,
  "data": { "deleted": true }
}
```

### POST /projects/:id/init-roadmap

Inicializa o roadmap do projeto com sprints padrão.

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "sprints_created": 4,
    "roadmap_items_created": 8
  }
}
```

---

## Clients

### GET /clients

Lista todos os clientes do usuário.

**Resposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "contact": {},
      "notes": "string",
      "created_at": "timestamp"
    }
  ]
}
```

### POST /clients

Cria um novo cliente.

**Body:**
```json
{
  "name": "string (obrigatório)",
  "contact": {
    "email": "string",
    "phone": "string"
  },
  "notes": "string"
}
```

### PUT /clients/:id

Atualiza um cliente.

### DELETE /clients/:id

Deleta um cliente.

---

## Tasks

### GET /tasks?projectId={id}

Lista tarefas, opcionalmente filtradas por projeto.

**Parâmetros:**
- `projectId` (query, opcional): UUID do projeto

**Resposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "todo|in_progress|review|done",
      "priority": "low|medium|high",
      "estimate_hours": number,
      "project_id": "uuid",
      "sprint_id": "uuid"
    }
  ]
}
```

### POST /tasks

Cria uma nova tarefa.

**Body:**
```json
{
  "title": "string (obrigatório)",
  "description": "string",
  "project_id": "uuid",
  "sprint_id": "uuid (opcional)",
  "priority": "low|medium|high",
  "estimate_hours": number
}
```

### PUT /tasks/:id

Atualiza uma tarefa.

### DELETE /tasks/:id

Deleta uma tarefa.

### POST /tasks/move

Move uma tarefa entre colunas/status.

**Body:**
```json
{
  "id": "uuid",
  "status": "todo|in_progress|review|done",
  "sprint_id": "uuid (opcional)"
}
```

---

## Roadmap

### GET /roadmap/get?projectId={id}

Lista itens do roadmap de um projeto.

**Parâmetros:**
- `projectId` (query, obrigatório): UUID do projeto

### POST /roadmap/create

Cria um novo item no roadmap.

**Body:**
```json
{
  "project_id": "uuid",
  "title": "string",
  "description": "string",
  "status": "planned|in_progress|completed",
  "target_date": "date"
}
```

### PUT /roadmap/update

Atualiza um item do roadmap.

**Body:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "planned|in_progress|completed"
}
```

### DELETE /roadmap/delete

Deleta um item do roadmap.

**Body:**
```json
{
  "id": "uuid"
}
```

---

## Workspace

### GET /workspace/get?id={id}

Busca informações de um workspace.

**Parâmetros:**
- `id` (query): UUID do workspace

### POST /workspace/patch

Sincroniza um arquivo do workspace.

**Body:**
```json
{
  "workspaceId": "uuid",
  "path": "string (caminho relativo)",
  "content": "string (conteúdo do arquivo)",
  "commitOnSave": boolean
}
```

### POST /workspace/snapshot

Cria um snapshot do workspace.

**Body:**
```json
{
  "workspaceId": "uuid",
  "name": "string"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "storage_path": "string",
    "created_at": "timestamp"
  }
}
```

### POST /workspace/commit

Realiza commit e push para GitHub.

**Body:**
```json
{
  "workspaceId": "uuid",
  "message": "string",
  "repo": "string",
  "branch": "string (opcional, default: main)"
}
```

---

## GitHub

### POST /github/connect

Conecta conta GitHub via OAuth.

**Body:**
```json
{
  "code": "string (código OAuth)",
  "state": "string"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "connected": true,
    "username": "string"
  }
}
```

### GET /github/repos

Lista repositórios do GitHub conectado.

**Resposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": number,
      "name": "string",
      "full_name": "string",
      "private": boolean,
      "html_url": "string"
    }
  ]
}
```

### POST /github/commit-push

Realiza commit e push server-side.

**Body:**
```json
{
  "workspace_id": "uuid",
  "repo": "string",
  "branch": "string",
  "message": "string",
  "files": [
    {
      "path": "string",
      "content": "string"
    }
  ]
}
```

---

## Supabase Management

### POST /supabase/connect

Conecta ou cria um projeto Supabase.

**Body (OAuth):**
```json
{
  "authType": "oauth",
  "email": "string",
  "password": "string"
}
```

**Body (URL/Key):**
```json
{
  "authType": "url_key",
  "projectRef": "string",
  "url": "string",
  "anonKey": "string"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "project_ref": "string",
    "url": "string",
    "anon_key": "string (criptografado)"
  }
}
```

### GET /supabase/projects

Lista projetos Supabase conectados.

### DELETE /supabase/:projectRef

Remove conexão com projeto Supabase.

---

## Finance / FINCORE

### POST /finance/sync-kiwify

Sincroniza vendas do Kiwify.

**Body:**
```json
{
  "since": "date (opcional)"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "payments_created": number,
    "licenses_created": number
  }
}
```

### GET /finance/products

Lista produtos e versões.

**Resposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "version": "string",
      "licenses_sold": number,
      "licenses_active": number,
      "unit_price": number,
      "total_revenue": number
    }
  ]
}
```

### GET /fincore/summary

Resumo financeiro e KPIs.

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "total_balance": number,
    "funds": [
      {
        "id": "uuid",
        "name": "string",
        "code": "string",
        "balance": number
      }
    ],
    "kpis": {
      "roi": number,
      "ltv": number,
      "cac": number,
      "runway": number,
      "total_revenue": number,
      "active_licenses": number
    }
  }
}
```

### POST /fincore/distribute

Distribui receitas automaticamente.

**Body:**
```json
{
  "paymentId": "uuid",
  "allocationPlan": {
    "reinvestimento": 0.3,
    "marketing": 0.2,
    "reserva": 0.2,
    "inovacao": 0.15,
    "pro_labore": 0.1,
    "investimentos": 0.05
  }
}
```

### POST /fincore/simulate

Simula cenário financeiro.

**Body:**
```json
{
  "scenario": "baseline|optimistic|pessimistic",
  "months": number,
  "revenue_per_month": number,
  "expenses_per_month": number
}
```

### GET /fincore/insights

Insights financeiros da IA.

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "insights": [
      {
        "type": "info|warning|success",
        "title": "string",
        "message": "string"
      }
    ]
  }
}
```

---

## Budgets & Receipts

### GET /budgets/get

Lista orçamentos.

### POST /budgets/create

Cria um orçamento.

**Body:**
```json
{
  "title": "string",
  "client_id": "uuid",
  "project_id": "uuid",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": "string"
    }
  ],
  "total_amount": number
}
```

### POST /budgets/send

Envia orçamento por email.

**Body:**
```json
{
  "budgetId": "uuid",
  "email": "string"
}
```

### GET /receipts/get

Lista recibos.

### POST /receipts/generate

Gera PDF de recibo.

**Body:**
```json
{
  "paymentId": "uuid",
  "receiptData": {
    "amount": number,
    "client": "string"
  }
}
```

---

## AI / Creative Sessions

### POST /ai/chat

Envia mensagem para IA.

**Body:**
```json
{
  "sessionId": "uuid (opcional)",
  "message": "string"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "role": "assistant",
    "content": "string",
    "session_id": "uuid"
  }
}
```

### POST /ai/stt

Transcreve áudio para texto.

**Body:** multipart/form-data
- `audio`: arquivo de áudio

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "transcript": "string",
    "audio_url": "string"
  }
}
```

### GET /creative-sessions/get

Lista sessões criativas.

### POST /creative-sessions/create

Cria nova sessão criativa.

---

## Deploy

### POST /deploy/start

Inicia deploy de um projeto.

**Body:**
```json
{
  "projectId": "uuid",
  "snapshotId": "uuid",
  "environment": "staging|production"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "deployment_id": "uuid",
    "status": "pending|building|deploying|success|failed",
    "preview_url": "string"
  }
}
```

### POST /deploy/debug

Inicia debug container.

**Body:**
```json
{
  "projectId": "uuid",
  "snapshotId": "uuid"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "tunnel_url": "string",
    "debug_port": number
  }
}
```

### GET /deployments/get?projectId={id}

Lista deployments de um projeto.

---

## Backup

### POST /backup/run

Executa backup completo.

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "backup_path": "string",
    "size": number,
    "created_at": "timestamp"
  }
}
```

---

## Activities

### GET /activities/get?projectId={id}

Lista atividades recentes.

**Parâmetros:**
- `projectId` (query, opcional): UUID do projeto

**Resposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "type": "string",
      "description": "string",
      "created_at": "timestamp"
    }
  ]
}
```

---

## Códigos de Status HTTP

- `200` - Sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno do servidor

---

## Tratamento de Erros

Todos os erros retornam:

```json
{
  "ok": false,
  "error": "Mensagem de erro descritiva"
}
```

Exemplos:
- `"Não autenticado"` - Token inválido ou ausente
- `"Workspace não encontrado"` - Workspace não existe ou não pertence ao usuário
- `"Campos obrigatórios faltando"` - Validação falhou

---

## Rate Limiting

Atualmente não há rate limiting implementado. Em produção, recomenda-se:
- 100 requisições/minuto por usuário
- 1000 requisições/hora por usuário

---

## Versão da API

Versão atual: **v1**

Base URL: `https://seu-projeto.supabase.co/functions/v1`

