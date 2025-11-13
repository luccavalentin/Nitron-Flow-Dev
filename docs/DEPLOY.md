# Guia de Deploy - NitronFlow Dev

## Pré-requisitos

1. Conta no Supabase
2. Projeto Supabase criado
3. Variáveis de ambiente configuradas

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

## Passo 3: Deploy do Frontend

### Opção 1: Vercel (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
3. Deploy automático a cada push

### Opção 2: Build Manual

```bash
cd frontend
npm install
npm run build
npm start
```

### Opção 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Passo 4: Configurar Domínio

1. Configure o domínio no seu provedor de hospedagem
2. Atualize as URLs nas variáveis de ambiente
3. Configure CORS no Supabase se necessário

## Passo 5: Go Live

1. Acesse o projeto no dashboard
2. Clique em "Go Live 🚀"
3. Aguarde o deploy
4. Acesse a URL gerada

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

