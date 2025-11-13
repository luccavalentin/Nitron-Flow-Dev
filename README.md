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
  /scripts           - Scripts auxiliares (daemon, etc)
  /sql               - Schema do banco de dados
  /docs              - Documentação
  /guias, prompts e comandos - Guias e especificações
```

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

### 🟡 Em Progresso

- Editor code-server (estrutura criada)
- Sistema de deploy
- Páginas de orçamentos e recibos

### ⏳ Pendente

- Microserviço FINCORE
- Debug remoto
- Documentação completa
- Testes automatizados

## Como Começar

1. Execute o schema SQL em `sql/nitronflow_schema.sql` no Supabase
2. Configure as variáveis de ambiente no Supabase
3. Deploy das Edge Functions
4. Configure o frontend com as variáveis de ambiente
5. Execute `npm install` e `npm run dev` no frontend

## Documentação

Consulte `docs/PROXIMOS_PASSOS.md` para o roadmap completo de implementação.
