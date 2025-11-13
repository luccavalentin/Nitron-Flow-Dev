# Quick Start - Executar Localmente

## Passo a Passo Rápido

### 1. Clone e Configure

```bash
# Se ainda não clonou, clone o repositório
git clone https://github.com/luccavalentin/Nitron-Flow-Dev.git
cd Nitron-Flow-Dev
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No SQL Editor, execute o conteúdo de `sql/nitronflow_schema.sql`
3. No Storage, crie os buckets:
   - `workspaces`
   - `snapshots`
   - `receipts`
   - `ai-uploads`
   - `backups`

### 3. Configure Variáveis de Ambiente

```bash
cd frontend
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase (encontre em Settings > API)

### 4. Instale e Execute

```bash
npm install
npm run dev
```

### 5. Acesse

Abra `http://localhost:3000` no navegador

## Pronto! 🎉

Agora você pode:
- Fazer login ou criar conta
- Criar projetos
- Gerenciar clientes e tarefas
- Usar todas as funcionalidades localmente

## Troubleshooting

**Erro de conexão com Supabase:**
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o projeto Supabase está ativo

**Erro ao fazer login:**
- Verifique se o Auth está habilitado no Supabase
- Verifique se o email está confirmado

**Edge Functions não funcionam:**
- Deploy as Edge Functions no Supabase (veja `docs/DEPLOY.md`)
- Ou use Supabase CLI para desenvolvimento local

