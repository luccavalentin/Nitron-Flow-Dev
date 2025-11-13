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

## 📊 Status de Implementação

**Versão Atual: V105** | **Progresso: 92% Completo**

### ✅ Implementado (30+ Edge Functions, 15+ Páginas)

#### 🔐 Autenticação (100%)

- Login email/senha
- Login GitHub OAuth
- Proteção de rotas
- Gerenciamento de sessão

#### 📁 Projetos (100%)

- CRUD completo
- Roadmap
- Deployments
- Integrações

#### 👥 Clientes (100%)

- CRUD completo
- Gerenciamento de contatos

#### ✅ Tarefas (100%)

- CRUD completo
- Kanban board com drag & drop
- Mover entre status

#### 💰 Financeiro (90%)

- Sincronizar Kiwify
- Listar produtos/versões
- Orçamentos e recibos
- FINCORE AI (summary, distribute)

#### 🗄️ Banco de Dados (80%)

- Conectar Supabase
- Query editor
- Gerenciar conexões

#### ⚙️ Configurações (100%)

- Perfil do usuário
- Tema claro/escuro
- Integrações

### 🟡 Em Progresso

- Editor code-server (estrutura criada)
- Melhorias de UX/UI

### ⏳ Pendente

- Microserviço FINCORE completo
- Debug remoto
- Testes automatizados

## 📚 Documentação

### Documentação Principal
- **`docs/DOCUMENTACAO_COMPLETA.md`** 📚 - **DOCUMENTAÇÃO MESTRE COMPLETA**
- **`docs/HISTORICO_MUDANCAS.md`** 📝 - Histórico completo de todas as mudanças
- **`REVISAO_ESPECIFICACAO_COMPLETA.md`** ✅ - Revisão detalhada vs especificação
- **`STATUS_FINAL.md`** 📊 - Status consolidado do sistema

### Guias de Setup
- **`docs/readme_setup.md`** 🚀 - Guia completo de setup passo a passo
- **`docs/QUICK_START.md`** ⚡ - Guia rápido para começar
- **`docs/DEPLOY.md`** 🚢 - Guia de deploy em produção

### Referências Técnicas
- **`docs/api_reference.md`** 🔌 - Referência completa da API
- **`docs/ui_specs.md`** 🎨 - Especificações de UI detalhadas
- **`docs/edge_functions.md`** ⚙️ - Documentação técnica das Edge Functions
- **`docs/qa_checklist.md`** ✅ - Checklist completo de QA
- **`docs/WORKSPACE_SETUP.md`** 💻 - Setup do workspace

### Especificação Original
- `guias, prompts e comandos/NITRONFLOW_DEV_ESPECIFICACAO_COMPLETA.md` - Especificação completa original

## 💡 Dicas

- Use `npm run dev` para desenvolvimento com hot reload
- Use `npm run build && npm start` para testar em modo produção local
- Todas as alterações são versionadas automaticamente no GitHub
- O botão "Go Live" na interface é para deploy futuro (quando implementado)

## 📝 Notas

- Todas as versões são commitadas automaticamente
- Padrão de commit: `V[N] DATE [DD/MM/YY] AS [HH:MM] - [Descrição]`
- Tudo está sincronizado no GitHub
