# Edge Functions - NitronFlow Dev

Documentação técnica de todas as Edge Functions implementadas.

## Estrutura Geral

Todas as Edge Functions seguem este padrão:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // 3. Validar autenticação
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Processar requisição
    // ...

    // 5. Retornar resposta
    return new Response(
      JSON.stringify({ ok: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## Projects

### `projects/get`

Lista projetos do usuário autenticado.

**Método:** GET

**Autenticação:** Requerida

**Query Params:** Nenhum

**Resposta:**
```typescript
{
  ok: true,
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    client_id: string | null;
    status: string;
    created_at: string;
    // ... outros campos
  }>
}
```

**Implementação:**
- Filtra por `owner_id = user.id`
- Ordena por `created_at DESC`
- Inclui relacionamentos com `clients`

---

### `projects/create`

Cria um novo projeto.

**Método:** POST

**Body:**
```typescript
{
  name: string; // obrigatório
  client_id?: string;
  description?: string;
  createWorkspace?: boolean;
  createSupabase?: boolean;
}
```

**Lógica:**
1. Valida campos obrigatórios
2. Cria registro em `projects`
3. Se `createWorkspace`: cria workspace e pasta no bucket
4. Se `createSupabase`: chama `supabase/connect` (após implementar)
5. Retorna projeto criado

---

### `projects/init-roadmap`

Inicializa roadmap com sprints padrão.

**Método:** POST

**Body:**
```typescript
{
  projectId: string;
}
```

**Lógica:**
1. Cria 4 sprints padrão:
   - Sprint 1: Setup
   - Sprint 2: Core Development
   - Sprint 3: QA & Testing
   - Sprint 4: Release
2. Cria roadmap items vinculados
3. Retorna contagem de itens criados

---

## Clients

### `clients/get`

Lista clientes do usuário.

**Método:** GET

**Lógica:**
- Filtra por `owner_id = user.id`
- Inclui contagem de projetos vinculados

### `clients/create`

Cria cliente.

**Body:**
```typescript
{
  name: string; // obrigatório
  contact?: {
    email?: string;
    phone?: string;
  };
  notes?: string;
}
```

---

## Tasks

### `tasks/get`

Lista tarefas, opcionalmente filtradas por projeto.

**Query Params:**
- `projectId` (opcional): UUID do projeto

**Lógica:**
- Se `projectId`: filtra por projeto
- Senão: retorna todas do usuário
- Inclui relacionamentos com `projects`, `sprints`

### `tasks/move`

Move tarefa entre status/sprints.

**Body:**
```typescript
{
  id: string;
  status: "todo" | "in_progress" | "review" | "done";
  sprint_id?: string;
}
```

**Lógica:**
1. Valida que tarefa pertence a projeto do usuário
2. Atualiza `status` e `sprint_id`
3. Registra em `telemetry_events`

---

## Workspace

### `workspace/patch`

Sincroniza arquivo do workspace.

**Método:** POST

**Body:**
```typescript
{
  workspaceId: string;
  path: string; // caminho relativo
  content: string;
  commitOnSave?: boolean;
}
```

**Lógica:**
1. Valida que workspace pertence a projeto do usuário
2. Salva arquivo em `workspaces/{workspaceId}/{path}`
3. Se `commitOnSave`: chama `workspace/commit`
4. Registra telemetria

**Storage:**
- Bucket: `workspaces`
- Path: `workspaces/{workspaceId}/{relativePath}`

---

### `workspace/snapshot`

Cria snapshot do workspace.

**Body:**
```typescript
{
  workspaceId: string;
  name: string;
}
```

**Lógica:**
1. Lista todos os arquivos do workspace no bucket
2. Cria ZIP
3. Salva ZIP em bucket `snapshots`
4. Cria registro em tabela `snapshots`
5. Retorna snapshot criado

---

### `workspace/commit`

Commit e push para GitHub.

**Body:**
```typescript
{
  workspaceId: string;
  message: string;
  repo?: string;
  branch?: string;
}
```

**Lógica:**
1. Busca token GitHub em `integrations`
2. Lista arquivos do workspace
3. Cria tree no GitHub
4. Cria commit
5. Atualiza branch reference
6. Registra telemetria

**Nota:** Atualmente simulado. Implementar com GitHub API.

---

## GitHub

### `github/connect`

OAuth flow GitHub.

**Body:**
```typescript
{
  code: string; // código OAuth
  state: string;
}
```

**Lógica:**
1. Troca `code` por `access_token` via GitHub API
2. Busca dados do usuário GitHub
3. Salva token criptografado em `integrations`
4. Retorna status de conexão

---

## Supabase Management

### `supabase/connect`

Conecta ou cria projeto Supabase.

**Body (OAuth):**
```typescript
{
  authType: "oauth";
  email: string;
  password: string;
}
```

**Body (URL/Key):**
```typescript
{
  authType: "url_key";
  projectRef: string;
  url: string;
  anonKey: string;
}
```

**Lógica:**
- OAuth: autentica e lista projetos
- URL/Key: valida conexão com `SELECT now()`
- Salva credenciais criptografadas em `integrations`

---

## Finance / FINCORE

### `finance/sync-kiwify`

Sincroniza vendas do Kiwify.

**Body:**
```typescript
{
  since?: string; // data ISO
}
```

**Lógica:**
1. Chama API Kiwify com token
2. Mapeia vendas para `payments`
3. Cria `licenses` para cada venda
4. Retorna contagem

---

### `fincore/distribute`

Distribui receitas automaticamente.

**Body:**
```typescript
{
  paymentId: string;
  allocationPlan?: {
    reinvestimento: number;
    marketing: number;
    reserva: number;
    inovacao: number;
    pro_labore: number;
    investimentos: number;
  };
}
```

**Lógica:**
1. Busca pagamento
2. Aplica plano de alocação (ou padrão)
3. Cria `financial_transactions` para cada fundo
4. Atualiza `financial_funds.balance`
5. Retorna transações criadas

---

### `fincore/summary`

Resumo financeiro e KPIs.

**Lógica:**
1. Calcula saldo total (soma de todos os fundos)
2. Busca KPIs:
   - ROI: (receita - investimento) / investimento * 100
   - LTV: Lifetime Value médio
   - CAC: Customer Acquisition Cost
   - Runway: meses até zerar saldo
3. Retorna fundos, KPIs e transações recentes

---

### `fincore/simulate`

Simula cenário financeiro.

**Body:**
```typescript
{
  scenario: "baseline" | "optimistic" | "pessimistic";
  months: number;
  revenue_per_month: number;
  expenses_per_month: number;
}
```

**Lógica:**
1. Calcula saldo inicial
2. Para cada mês:
   - Aplica receita/despesa
   - Calcula novo saldo
   - Calcula runway
3. Retorna simulação completa

---

## AI

### `ai/chat`

Chat com IA (DeepSeek/OpenAI).

**Body:**
```typescript
{
  sessionId?: string;
  message: string;
}
```

**Lógica:**
1. Cria ou busca `creative_sessions`
2. Chama API DeepSeek/OpenAI
3. Salva mensagens em `ai_messages`
4. Retorna resposta da IA

---

### `ai/stt`

Speech to Text (Whisper/Deepgram).

**Body:** multipart/form-data
- `audio`: arquivo de áudio

**Lógica:**
1. Salva áudio em bucket `ai-uploads`
2. Chama API STT (Whisper/Deepgram)
3. Retorna transcript

---

## Deploy

### `deploy/start`

Inicia deploy.

**Body:**
```typescript
{
  projectId: string;
  snapshotId: string;
  environment: "staging" | "production";
}
```

**Lógica:**
1. Cria registro em `deployments`
2. Trigger webhook para runner externo
3. Retorna deployment com status `pending`

---

## Backup

### `backup/run`

Executa backup completo.

**Lógica:**
1. Exporta schema SQL
2. Zipa snapshots importantes
3. Salva em bucket `backups`
4. Retorna path do backup

---

## Testes

### Testar Localmente

```bash
# Usar Supabase CLI
supabase functions serve projects/get --env-file .env.local
```

### Testar em Produção

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/projects/create \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste"}'
```

---

## Boas Práticas

1. **Sempre validar autenticação** no início
2. **Validar inputs** antes de processar
3. **Usar transações** para operações múltiplas
4. **Registrar telemetria** para ações importantes
5. **Tratar erros** adequadamente
6. **Retornar formato padrão** `{ ok, data?, error? }`

---

## Segurança

1. **Nunca expor Service Role Key** no frontend
2. **Criptografar tokens** em `integrations`
3. **Validar RLS** nas queries
4. **Sanitizar inputs** de usuário
5. **Rate limiting** (implementar futuramente)

---

## Performance

1. **Usar índices** nas queries frequentes
2. **Limitar resultados** com paginação
3. **Cache** quando apropriado
4. **Otimizar queries** com `select` específico

---

## Logging

Registrar em `telemetry_events`:
- Ações importantes (criar projeto, deploy, etc)
- Erros críticos
- Performance metrics

Exemplo:
```typescript
await supabaseClient.from("telemetry_events").insert({
  project_id: projectId,
  event_type: "project_created",
  payload: { name, client_id },
});
```

