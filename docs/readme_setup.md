# Setup Completo - NitronFlow Dev

Guia passo a passo para configurar e executar o NitronFlow Dev localmente e em produção.

---

## 📋 Pré-requisitos

### Software Necessário

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verificar: `node --version`

2. **Git**
   - Download: https://git-scm.com/
   - Verificar: `git --version`

3. **Supabase CLI** (opcional, para desenvolvimento local)
   - Instalar: `npm install -g supabase`
   - Verificar: `supabase --version`

4. **Conta Supabase**
   - Criar em: https://supabase.com
   - Criar novo projeto

---

## 🚀 Setup Local - Passo a Passo

### Passo 1: Clonar Repositório

```bash
git clone https://github.com/seu-usuario/nitronflow-dev.git
cd nitronflow-dev
```

### Passo 2: Configurar Supabase

#### 2.1 Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie um novo projeto
3. Anote:
   - Project URL
   - Anon Key
   - Service Role Key (Settings → API)

#### 2.2 Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Abra o arquivo `sql/nitronflow_schema.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Execute (Run)
6. Verifique se todas as tabelas foram criadas (Database → Tables)

#### 2.3 Criar Buckets no Storage

1. Vá em **Storage** no Supabase Dashboard
2. Crie os seguintes buckets (públicos):
   - `workspaces`
   - `snapshots`
   - `receipts`
   - `ai-uploads`
   - `backups`

Para cada bucket:
- Nome: conforme acima
- Public: ✅ (ou conforme necessidade)
- File size limit: 50MB (ou maior se necessário)

#### 2.4 Configurar Environment Variables

No Supabase Dashboard, vá em **Settings → Edge Functions → Secrets** e adicione:

```
SERVICE_ROLE_KEY=sua_service_role_key_aqui
GITHUB_CLIENT_ID=seu_github_client_id (opcional)
GITHUB_CLIENT_SECRET=seu_github_client_secret (opcional)
DEEPSEEK_API_KEY=sua_deepseek_key (opcional)
KIWIFY_API_KEY=sua_kiwify_key (opcional)
FYNC_CORE_SECRET=sua_fincore_secret (opcional)
```

### Passo 3: Configurar Frontend

#### 3.1 Instalar Dependências

```bash
cd frontend
npm install
```

#### 3.2 Criar Arquivo de Ambiente

```bash
cp .env.local.example .env.local
```

#### 3.3 Editar `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

### Passo 4: Deployar Edge Functions

#### 4.1 Instalar Supabase CLI (se ainda não tiver)

```bash
npm install -g supabase
```

#### 4.2 Login no Supabase

```bash
supabase login
```

#### 4.3 Linkar Projeto

```bash
supabase link --project-ref seu-project-ref
```

#### 4.4 Deployar Functions

```bash
# Deploy individual
supabase functions deploy projects/get
supabase functions deploy projects/create
# ... etc

# Ou deploy todas de uma vez (script)
cd backend/edge-functions
# Criar script de deploy (ver abaixo)
```

**Script de Deploy (criar `deploy-all.sh`):**

```bash
#!/bin/bash
supabase functions deploy projects/get
supabase functions deploy projects/create
supabase functions deploy projects/update
supabase functions deploy projects/delete
supabase functions deploy projects/get-by-id
supabase functions deploy projects/init-roadmap
supabase functions deploy clients/get
supabase functions deploy clients/create
supabase functions deploy clients/update
supabase functions deploy clients/delete
supabase functions deploy tasks/get
supabase functions deploy tasks/create
supabase functions deploy tasks/update
supabase functions deploy tasks/delete
supabase functions deploy tasks/move
supabase functions deploy roadmap/get
supabase functions deploy roadmap/create
supabase functions deploy roadmap/update
supabase functions deploy roadmap/delete
supabase functions deploy workspace/get
supabase functions deploy workspace/patch
supabase functions deploy workspace/snapshot
supabase functions deploy workspace/commit
supabase functions deploy github/connect
supabase functions deploy github/repos
supabase functions deploy github/commit-push
supabase functions deploy supabase/connect
supabase functions deploy supabase/projects
supabase functions deploy supabase/delete
supabase functions deploy deploy/start
supabase functions deploy deploy/debug
supabase functions deploy deployments/get
supabase functions deploy finance/sync-kiwify
supabase functions deploy finance/products
supabase functions deploy fincore/summary
supabase functions deploy fincore/distribute
supabase functions deploy fincore/simulate
supabase functions deploy fincore/insights
supabase functions deploy budgets/create
supabase functions deploy budgets/get
supabase functions deploy budgets/send
supabase functions deploy receipts/get
supabase functions deploy receipts/generate
supabase functions deploy payments/get
supabase functions deploy licenses/get
supabase functions deploy ai/chat
supabase functions deploy ai/stt
supabase functions deploy creative-sessions/get
supabase functions deploy creative-sessions/create
supabase functions deploy activities/get
supabase functions deploy snapshots/get
supabase functions deploy backup/run
```

### Passo 5: Executar Frontend

```bash
cd frontend
npm run dev
```

O projeto estará disponível em: **http://localhost:3000**

### Passo 6: Testar Sistema

1. Acesse http://localhost:3000
2. Faça login (em dev mode, qualquer credencial funciona)
3. Crie um cliente
4. Crie um projeto
5. Teste as funcionalidades

---

## 🔧 Configuração do Daemon (Sincronização Local)

### Instalar Dependências

```bash
cd scripts
npm install
```

### Configurar Variáveis

Criar `.env` em `scripts/`:

```env
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
SUPABASE_TOKEN=seu_jwt_token_aqui
```

### Executar Daemon

```bash
node daemon_watcher.js <workspaceId> <caminho-do-projeto>
```

Exemplo:
```bash
node daemon_watcher.js abc-123-def /home/user/meu-projeto
```

---

## 🚀 Setup Produção

### Opção 1: Vercel (Frontend)

1. Conectar repositório GitHub à Vercel
2. Configurar Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
3. Deploy automático

### Opção 2: Self-Hosted

#### Frontend (Next.js)

```bash
cd frontend
npm run build
npm run start
```

#### Edge Functions (Supabase)

Já deployadas via Supabase CLI (ver Passo 4)

---

## 📝 Checklist de Setup

- [ ] Node.js instalado
- [ ] Git instalado
- [ ] Projeto Supabase criado
- [ ] Schema SQL executado
- [ ] Buckets criados (5 buckets)
- [ ] Environment Variables configuradas no Supabase
- [ ] Frontend `.env.local` configurado
- [ ] Dependências do frontend instaladas
- [ ] Edge Functions deployadas
- [ ] Frontend rodando localmente
- [ ] Login funcionando
- [ ] CRUD básico testado

---

## 🐛 Troubleshooting

### Erro: "Não autenticado"

- Verificar se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
- Verificar se o token JWT está sendo enviado nas requisições

### Erro: "Bucket não encontrado"

- Verificar se os buckets foram criados no Supabase Storage
- Verificar permissões dos buckets (público/privado)

### Erro: "Edge Function não encontrada"

- Verificar se a function foi deployada: `supabase functions list`
- Verificar se o nome da function está correto na URL

### Erro: "RLS policy violation"

- Verificar se as policies RLS estão corretas no schema
- Verificar se o usuário tem permissão para acessar os dados

### Frontend não carrega

- Verificar se `npm run dev` está rodando
- Verificar console do navegador para erros
- Verificar se as variáveis de ambiente estão corretas

---

## 📚 Próximos Passos

Após o setup completo:

1. **Testar todas as funcionalidades** conforme QA Checklist
2. **Configurar integrações** (GitHub, Kiwify, DeepSeek)
3. **Configurar code-server** para workspace online
4. **Configurar CI/CD** (GitHub Actions)
5. **Configurar observabilidade** (Sentry, Grafana)

---

## 🔐 Segurança

### Em Produção

1. **Rotacionar Service Role Key** periodicamente
2. **Usar HTTPS** sempre
3. **Configurar CORS** adequadamente
4. **Validar inputs** em todas as Edge Functions
5. **Implementar rate limiting**
6. **Auditar logs** regularmente

### Secrets

- Nunca commitar `.env.local` ou `.env`
- Usar variáveis de ambiente do Supabase para secrets
- Rotacionar chaves periodicamente

---

## 📞 Suporte

Para problemas ou dúvidas:
- Verificar logs no Supabase Dashboard
- Verificar console do navegador
- Consultar documentação em `/docs`

---

## ✅ Verificação Final

Execute estes comandos para verificar se tudo está funcionando:

```bash
# Frontend
cd frontend && npm run dev
# Deve iniciar sem erros

# Verificar Edge Functions
supabase functions list
# Deve listar todas as functions deployadas

# Verificar Schema
# No Supabase Dashboard → Database → Tables
# Deve mostrar todas as tabelas do schema
```

---

**Setup completo!** 🎉

Agora você pode começar a usar o NitronFlow Dev.

