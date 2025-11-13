# Guia de Execução Local - NitronFlow Dev

## Pré-requisitos

1. Node.js 18+ instalado
2. Conta no Supabase
3. Projeto Supabase criado
4. Git configurado

## Passo 1: Configurar Supabase

1. Execute o schema SQL em `sql/nitronflow_schema.sql` no SQL Editor do Supabase
2. Crie os buckets no Storage:
   - `workspaces`
   - `snapshots`
   - `receipts`
   - `ai-uploads`
   - `backups`
3. Configure as Environment Variables no Supabase:
   - `SERVICE_ROLE_KEY`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `DEEPSEEK_API_KEY`
   - `KIWIFY_API_KEY`
   - `FYNC_CORE_SECRET`

## Passo 2: Deploy das Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link do projeto
supabase link --project-ref your-project-ref

# Deploy das funções
supabase functions deploy projects/get
supabase functions deploy projects/create
supabase functions deploy projects/init-roadmap
supabase functions deploy clients/get
supabase functions deploy clients/create
supabase functions deploy tasks/get
supabase functions deploy tasks/create
supabase functions deploy tasks/update
supabase functions deploy tasks/delete
supabase functions deploy tasks/move
supabase functions deploy workspace/patch
supabase functions deploy workspace/snapshot
supabase functions deploy github/connect
supabase functions deploy github/repos
supabase functions deploy supabase/connect
supabase functions deploy deploy/start
supabase functions deploy finance/sync-kiwify
supabase functions deploy fincore/summary
supabase functions deploy fincore/distribute
supabase functions deploy ai/chat
```

## Passo 3: Executar o Frontend Localmente

### Modo Desenvolvimento (Recomendado)

```bash
cd frontend
npm install
npm run dev
```

O projeto estará disponível em: `http://localhost:3000`

### Modo Produção Local

```bash
cd frontend
npm install
npm run build
npm start
```

### Configurar Variáveis de Ambiente

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

## Passo 4: Acessar o Projeto

1. Abra `http://localhost:3000` no navegador
2. Faça login ou crie uma conta
3. Comece a usar o NitronFlow Dev!

## Troubleshooting

### Erro de CORS
- Verifique as configurações de CORS no Supabase
- Adicione seu domínio nas allowed origins

### Erro de autenticação
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o Supabase Auth está configurado

### Edge Functions não funcionam
- Verifique se todas as funções foram deployadas
- Verifique os logs no Supabase Dashboard

