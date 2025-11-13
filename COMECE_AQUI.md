# 🚀 COMECE AQUI - Visualizar o Projeto Localmente

## Passo 1: Configure o Supabase (Se ainda não fez)

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No SQL Editor, execute o conteúdo de `sql/nitronflow_schema.sql`
3. No Storage, crie os buckets: `workspaces`, `snapshots`, `receipts`, `ai-uploads`, `backups`

## Passo 2: Configure as Variáveis de Ambiente

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

**Onde encontrar:**
- Supabase Dashboard > Settings > API
- Copie a "Project URL" e "anon public" key

## Passo 3: Execute o Projeto

### Opção A: Script Automático (Windows)

```bash
scripts\start-local.bat
```

### Opção B: Manual

```bash
cd frontend
npm install
npm run dev
```

## Passo 4: Acesse no Navegador

Abra: **http://localhost:3000**

## ✅ Pronto!

Agora você pode:
- Fazer login ou criar conta
- Criar projetos
- Gerenciar tudo localmente

## ⚠️ Se der erro:

1. Verifique se Node.js está instalado: `node --version`
2. Verifique se as variáveis de ambiente estão corretas
3. Verifique o console do navegador (F12) para erros
4. Verifique o terminal para mensagens de erro

