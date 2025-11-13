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

## 🚀 Deploy Rápido (Go Live)

### Opção 1: Vercel (Recomendado - Mais Rápido)

1. **Conecte o repositório à Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Importe este repositório GitHub
   - Configure as variáveis de ambiente:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL` (URL das Edge Functions)

2. **Deploy automático:**
   - A Vercel fará deploy automaticamente
   - Você receberá uma URL: `https://seu-projeto.vercel.app`

3. **Acesse o projeto:**
   - A URL estará disponível imediatamente
   - Faça login e comece a usar!

### Opção 2: Deploy Manual

```bash
# 1. Configure as variáveis de ambiente
cd frontend
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 2. Instale dependências e faça build
npm install
npm run build

# 3. Execute em produção
npm start
```

### Opção 3: Usando o Script

```bash
# Deploy em produção
chmod +x scripts/deploy.sh
./scripts/deploy.sh production

# Deploy em staging
./scripts/deploy.sh staging
```

## 📋 Pré-requisitos para Deploy

1. **Supabase configurado:**
   - Execute `sql/nitronflow_schema.sql` no SQL Editor
   - Crie os buckets no Storage
   - Configure as Environment Variables

2. **Edge Functions deployadas:**
   - Veja `docs/DEPLOY.md` para instruções completas

3. **Variáveis de ambiente:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`

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
- **Sistema de Deploy e Go Live** 🚀

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

## 🎯 Como Usar o Go Live

1. Acesse um projeto no dashboard
2. Clique em "Go Live 🚀" na página de detalhes
3. Aguarde o deploy (alguns segundos)
4. Acesse a URL gerada para visualizar seu projeto em produção!

## 📝 Notas

- Todas as versões são commitadas automaticamente
- Padrão de commit: `V[N] DATE [DD/MM/YY] AS [HH:MM] - [Descrição]`
- Tudo está sincronizado no GitHub
