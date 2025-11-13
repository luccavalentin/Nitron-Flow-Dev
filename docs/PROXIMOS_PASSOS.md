# Próximos Passos - NitronFlow Dev

## Status Atual ✅

### Implementado:
- ✅ Estrutura completa de pastas
- ✅ Schema SQL (`nitronflow_schema.sql`)
- ✅ Frontend Next.js configurado (TypeScript, Tailwind)
- ✅ Autenticação (login, callback, OAuth GitHub)
- ✅ Layout base (Sidebar, Header com tema claro/escuro)
- ✅ Dashboard com cards de resumo
- ✅ Página de Projetos (lista e criação)
- ✅ Página de Clientes (lista e criação)
- ✅ Edge Functions: Projects (get, create, init-roadmap)
- ✅ Edge Functions: Clients (get, create)
- ✅ Edge Functions: Tasks (get, create, move)

---

## Próximos Passos Prioritários

### 1. COMPLETAR EDGE FUNCTIONS RESTANTES

#### 1.1 Tasks (completar)
- [ ] `tasks/update` - Atualizar tarefa
- [ ] `tasks/delete` - Deletar tarefa

#### 1.2 Workspace
- [ ] `workspace/patch` - Sincronizar arquivos do editor local
- [ ] `workspace/snapshot` - Criar snapshot do workspace
- [ ] `workspace/commit` - Commit e push para GitHub

#### 1.3 GitHub Integration
- [ ] `github/connect` - OAuth flow e salvar token
- [ ] `github/repos` - Listar repositórios do usuário
- [ ] `github/commit-push` - Commit e push server-side

#### 1.4 Supabase Management (Lovable-like)
- [ ] `supabase/connect` - Conectar/criar projeto Supabase
- [ ] `supabase/projects` - Listar projetos do usuário
- [ ] `supabase/delete` - Deletar conexão

#### 1.5 Deploy
- [ ] `deploy/start` - Iniciar deploy (trigger runner)
- [ ] `deploy/debug` - Iniciar debug container

#### 1.6 Finance / FINCORE
- [ ] `finance/sync-kiwify` - Sincronizar vendas do Kiwify
- [ ] `finance/products` - Listar produtos/versões
- [ ] `fincore/summary` - Resumo de fundos e KPIs
- [ ] `fincore/distribute` - Distribuir receitas automaticamente
- [ ] `fincore/simulate` - Simular cenários
- [ ] `fincore/insights` - Insights da IA

#### 1.7 AI / Creative Sessions
- [ ] `ai/chat` - Chat com DeepSeek/OpenAI
- [ ] `ai/stt` - Speech to text (Whisper/Deepgram)
- [ ] `creative_sessions` - Gerenciar sessões criativas

#### 1.8 Backup
- [ ] `backup/run` - Executar backup completo

---

### 2. COMPLETAR PÁGINAS FRONTEND

#### 2.1 Páginas Principais
- [ ] `/projects/[id]` - Detalhe do projeto (roadmap, sprints, tarefas, integrações)
- [ ] `/tasks` - Kanban board com drag & drop
- [ ] `/workspace/[id]` - Editor code-server embutido
- [ ] `/database` - Query editor e gerenciamento de conexões Supabase

#### 2.2 Financeiro
- [ ] `/finance` - Visão geral financeira
- [ ] `/fincore` - Painel FINCORE AI (fundos, KPIs, insights)
- [ ] `/budgets` - Gerenciar orçamentos
- [ ] `/receipts` - Gerenciar recibos
- [ ] `/versions` - Minhas versões finais (produtos/licenças)

#### 2.3 IA e Outros
- [ ] `/ai` - Ambiente de criação e storytelling (chat + voz)
- [ ] `/settings` - Configurações (integrações, variáveis, tema)

---

### 3. COMPONENTES UI

#### 3.1 Componentes de Layout
- [ ] Melhorar Sidebar (colapsável em mobile)
- [ ] Melhorar Header (busca global funcional)

#### 3.2 Componentes de Cards
- [ ] `ProjectCard` - Card de projeto reutilizável
- [ ] `ClientCard` - Card de cliente
- [ ] `TaskCard` - Card de tarefa para Kanban

#### 3.3 Componentes de Forms
- [ ] `ProjectForm` - Formulário de projeto
- [ ] `ClientForm` - Formulário de cliente
- [ ] `TaskForm` - Formulário de tarefa

#### 3.4 Componentes de Modals
- [ ] `CreateProjectModal` - Modal de criação de projeto
- [ ] `CreateClientModal` - Modal de criação de cliente
- [ ] `SupabaseConnectModal` - Modal Lovable-style para conectar Supabase

#### 3.5 Componentes de Kanban
- [ ] `KanbanBoard` - Board completo com drag & drop
- [ ] `KanbanColumn` - Coluna do Kanban
- [ ] `KanbanCard` - Card arrastável

#### 3.6 Componentes de Editor
- [ ] `CodeEditor` - Wrapper do code-server iframe
- [ ] `DatabasePanel` - Painel lateral de DB
- [ ] `SnapshotsList` - Lista de snapshots

---

### 4. FUNCIONALIDADES AVANÇADAS

#### 4.1 Workspace Sync
- [ ] `scripts/daemon_watcher.js` - Daemon para monitorar mudanças locais
- [ ] Sincronização automática de arquivos
- [ ] Snapshots automáticos periódicos

#### 4.2 Integração GitHub
- [ ] OAuth flow completo
- [ ] Listagem de repositórios
- [ ] Commit e push server-side
- [ ] Sincronização de branches

#### 4.3 Integração Supabase
- [ ] Modal de conexão Lovable-style
- [ ] Criação de projetos child via Management API
- [ ] Query editor funcional
- [ ] Visualização de tabelas

#### 4.4 Deploy System
- [ ] Integração com runner (Render/Fly/K8s)
- [ ] Preview URLs
- [ ] Logs de deploy em tempo real
- [ ] Debug remoto com tunnel

#### 4.5 FINCORE AI
- [ ] Microserviço Python/Node para cálculos
- [ ] Distribuição automática de receitas
- [ ] Cálculo de KPIs (ROI, LTV, CAC, Runway)
- [ ] Integração com DeepSeek para insights
- [ ] Cards educativos com explicações

#### 4.6 Kiwify Integration
- [ ] Sincronização de vendas
- [ ] Mapeamento para `payments` e `licenses`
- [ ] Geração automática de licenças

---

### 5. INFRAESTRUTURA

#### 5.1 Code-Server
- [ ] Configuração do code-server
- [ ] Integração com Supabase Storage
- [ ] Workspaces apontando para buckets

#### 5.2 Runner / CI/CD
- [ ] Configuração do runner (Render/Fly/K8s)
- [ ] GitHub Actions workflows
- [ ] Build e deploy automatizados

#### 5.3 Observabilidade
- [ ] Integração Sentry
- [ ] Integração Grafana
- [ ] Logging estruturado

---

### 6. DOCUMENTAÇÃO

#### 6.1 Documentação Técnica
- [ ] `docs/readme_setup.md` - Setup completo
- [ ] `docs/api_reference.md` - Referência completa da API
- [ ] `docs/ui_specs.md` - Especificações de UI
- [ ] `docs/edge_functions.md` - Documentação das Edge Functions
- [ ] `docs/qa_checklist.md` - Checklist de QA completo

#### 6.2 Documentação de Desenvolvimento
- [ ] Diagrama ER do banco de dados
- [ ] Postman collection
- [ ] Guias de contribuição
- [ ] Troubleshooting

---

### 7. TESTES E QA

#### 7.1 Testes Unitários
- [ ] Testes das Edge Functions
- [ ] Testes dos componentes React
- [ ] Testes de integração

#### 7.2 QA Checklist
- [ ] Executar checklist completo (tela por tela)
- [ ] Validar todos os endpoints
- [ ] Testar fluxos completos
- [ ] Validar segurança (RLS)
- [ ] Testar performance

---

### 8. MELHORIAS E POLIMENTO

#### 8.1 UX/UI
- [ ] Animações com Framer Motion
- [ ] Loading states
- [ ] Error handling melhorado
- [ ] Feedback visual para ações
- [ ] Responsividade completa

#### 8.2 Performance
- [ ] Otimização de queries
- [ ] Cache de dados
- [ ] Lazy loading
- [ ] Code splitting

#### 8.3 Segurança
- [ ] Validação de inputs
- [ ] Sanitização de dados
- [ ] Rate limiting
- [ ] Auditoria de ações

---

## Ordem Sugerida de Implementação

### Fase 1: Core Funcional (Prioridade Alta)
1. Completar Edge Functions de Tasks (update, delete)
2. Implementar página de detalhe do projeto
3. Implementar Kanban board de tarefas
4. Criar componentes de UI reutilizáveis

### Fase 2: Workspace e Integrações (Prioridade Alta)
5. Implementar workspace sync (daemon + Edge Function)
6. Integração GitHub (OAuth + commit/push)
7. Integração Supabase (conectar/criar projetos)
8. Editor code-server embutido

### Fase 3: Financeiro e FINCORE (Prioridade Média)
9. Integração Kiwify
10. Módulo FINCORE AI (distribuição, KPIs, insights)
11. Páginas financeiras (orçamentos, recibos, versões)

### Fase 4: IA e Features Avançadas (Prioridade Média)
12. Ambiente de IA (chat + voz)
13. Sistema de deploy
14. Debug remoto

### Fase 5: Polimento e Documentação (Prioridade Baixa)
15. Documentação completa
16. Testes e QA
17. Melhorias de UX/UI
18. Otimizações de performance

---

## Notas Importantes

- Sempre fazer commit e push após cada implementação
- Seguir padrão de versão: `V[N] DATE [DD/MM/YY] AS [HH:MM]`
- Atualizar `nitronflow_schema.sql` se houver mudanças no schema
- Testar cada funcionalidade antes de commitar
- Manter código limpo e documentado

