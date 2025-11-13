# Edge Functions

Edge Functions do Supabase para o NitronFlow Dev.

## Estrutura

Cada função deve:
- Validar autenticação via `Authorization: Bearer <supabase_jwt>`
- Retornar formato: `{ ok: boolean, data?: any, error?: string }`
- Usar `service_role` apenas server-side para Management API
- Registrar telemetria em `telemetry_events` quando necessário

## Funções implementadas

- ✅ `projects/get` - Lista projetos do usuário
- ✅ `projects/create` - Criar projeto
- ✅ `projects/init-roadmap` - Inicializar roadmap

## Funções a implementar

- `clients/*` - CRUD de clientes
- `tasks/*` - CRUD de tarefas
- `workspace/patch` - Sincronizar arquivos
- `workspace/snapshot` - Criar snapshot
- `workspace/commit` - Commit e push
- `github/connect` - OAuth GitHub
- `supabase/connect` - Conectar/criar projeto Supabase
- `deploy/start` - Iniciar deploy
- `finance/sync-kiwify` - Sincronizar Kiwify
- `fincore/distribute` - Distribuir receitas
- `ai/chat` - Chat com IA
- `ai/stt` - Speech to text

## Como deployar

```bash
supabase functions deploy projects/get
supabase functions deploy projects/create
supabase functions deploy projects/init-roadmap
```
