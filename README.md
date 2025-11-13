# Nitron-Flow-Dev

Plataforma pessoal de desenvolvimento e gestão (PT-BR) que reúne editor online, sincronização com editor local, GitHub, gerenciamento de projetos, integração Supabase, módulo financeiro inteligente FINCORE AI, ambiente de criação/storytelling e orquestração de deploys.

## Controle de Versões

Todas as versões são controladas via Git/GitHub seguindo o padrão:
**V[NÚMERO] DATE [DATA] AS [HORA]**

## Stack Técnico

- **Frontend**: Next.js + TypeScript + Tailwind CSS + shadcn UI
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **Editor**: code-server (VSCode Web)
- **Integrações**: GitHub OAuth, Supabase Management API, Kiwify API, DeepSeek AI

## Estrutura do Projeto

```
/nitronflow-dev
  /frontend          - Aplicação Next.js
  /backend           - Edge Functions Supabase
  /scripts           - Scripts auxiliares (daemon, deploy, etc)
  /sql               - Schema do banco de dados
  /docs              - Documentação
  /guias, prompts e comandos - Guias e especificações
```

## 🚀 Como Executar Localmente

### Passo 1: Configurar Variáveis de Ambiente

```bash
cd frontend
cp .env.example .env.local
```

Edite `frontend/.env.local` com suas credenciais do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

### Passo 2: Instalar Dependências

```bash
cd frontend
npm install
```

### Passo 3: Executar o Projeto

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# O projeto estará disponível em:
# http://localhost:3000
```

### Passo 4: Acessar o Projeto

1. Abra seu navegador em `http://localhost:3000`
2. Faça login ou crie uma conta
3. Comece a usar o NitronFlow Dev!

## 📋 Pré-requisitos

1. **Node.js instalado** (versão 18 ou superior)
2. **Supabase configurado:**
   - Execute `sql/nitronflow_schema.sql` no SQL Editor do Supabase
   - Crie os buckets no Storage: `workspaces`, `snapshots`, `receipts`, `ai-uploads`, `backups`
   - Configure as Environment Variables no Supabase

3. **Edge Functions deployadas** (opcional para desenvolvimento local):
   - Veja `docs/DEPLOY.md` para instruções de deploy das Edge Functions
   - Para desenvolvimento, você pode testar localmente usando Supabase CLI

## Status de Implementação

### ✅ Implementado

- Estrutura completa do projeto
- Schema SQL completo
- Autenticação (email/senha + GitHub OAuth)
- Layout responsivo com tema claro/escuro
- Dashboard com resumo
- CRUD de Projetos
- CRUD de Clientes
- CRUD completo de Tarefas
- Kanban board com drag & drop
- Workspace sync (patch, snapshot)
- Integração GitHub (connect, repos)
- Integração Supabase (connect)
- Módulo Financeiro (sync Kiwify)
- FINCORE AI (summary, distribute)
- Ambiente de IA (chat)
- Sistema de Deploy (estrutura criada)

### 🟡 Em Progresso

- Editor code-server (estrutura criada)
- Páginas de orçamentos e recibos

### ⏳ Pendente

- Microserviço FINCORE
- Debug remoto
- Documentação completa
- Testes automatizados

## 📚 Documentação

- `docs/DEPLOY.md` - Guia completo de deploy
- `docs/PROXIMOS_PASSOS.md` - Roadmap de implementação
- `guias, prompts e comandos/NITRONFLOW_DEV_ESPECIFICACAO_COMPLETA.md` - Especificação completa

## 💡 Dicas

- Use `npm run dev` para desenvolvimento com hot reload
- Use `npm run build && npm start` para testar em modo produção local
- Todas as alterações são versionadas automaticamente no GitHub
- O botão "Go Live" na interface é para deploy futuro (quando implementado)

## 📝 Notas

- Todas as versões são commitadas automaticamente
- Padrão de commit: `V[N] DATE [DD/MM/YY] AS [HH:MM] - [Descrição]`
- Tudo está sincronizado no GitHub
