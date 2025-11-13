# QA Checklist - NitronFlow Dev

Checklist completo de testes para validação do sistema.

---

## 🔐 1. AUTENTICAÇÃO

### Login Email/Senha
- [ ] Login com credenciais válidas redireciona para `/dashboard`
- [ ] Login com credenciais inválidas mostra erro
- [ ] Campos obrigatórios validados
- [ ] Formato de email validado
- [ ] Sessão persiste após refresh
- [ ] Logout limpa sessão e redireciona para `/auth/login`

### Login GitHub OAuth
- [ ] Botão "Entrar com GitHub" redireciona para GitHub
- [ ] Callback processa código OAuth corretamente
- [ ] Token GitHub salvo em `integrations`
- [ ] Redirecionamento após OAuth funciona

### Dev Mode
- [ ] Login com qualquer credencial funciona quando Supabase não configurado
- [ ] Sessão dev persiste em localStorage
- [ ] Dados salvos localmente funcionam

**Arquivos:** `frontend/pages/auth/login.tsx`, `frontend/pages/auth/callback.tsx`

---

## 📊 2. DASHBOARD

### Cards de Resumo
- [ ] Card "Projetos" mostra número correto
- [ ] Card "Tarefas" mostra número correto
- [ ] Card "Clientes" mostra número correto
- [ ] Card "Receita Total" mostra valor correto
- [ ] Cards são clicáveis e redirecionam

### Gráficos
- [ ] Gráfico de Receita renderiza
- [ ] Gráfico de Tarefas por Status renderiza
- [ ] Gráfico de Projetos por Status renderiza
- [ ] Dados dos gráficos são corretos

### Feed de Atividades
- [ ] Lista atividades recentes
- [ ] Atividades ordenadas por data (mais recente primeiro)
- [ ] Formato de data correto (pt-BR)

### Ações Rápidas
- [ ] Botões redirecionam para páginas corretas
- [ ] Ícones visíveis

**Arquivos:** `frontend/pages/dashboard/index.tsx`

**Endpoints:** `GET /projects/summary`, `GET /finance/summary`, `GET /fincore/insights`

---

## 👥 3. CLIENTES

### Lista
- [ ] Lista todos os clientes do usuário
- [ ] Cards exibem nome e informações corretas
- [ ] Grid responsivo (1 col mobile, 3 col desktop)
- [ ] Estado vazio exibido quando não há clientes

### Criar Cliente
- [ ] Modal abre ao clicar "Novo Cliente"
- [ ] Campo nome obrigatório validado
- [ ] Cliente criado aparece na lista
- [ ] Modal fecha após criação

### Editar Cliente
- [ ] Edição funciona
- [ ] Mudanças persistem

### Deletar Cliente
- [ ] Confirmação antes de deletar
- [ ] Cliente removido da lista
- [ ] Projetos vinculados não são deletados (cascade)

**Arquivos:** `frontend/pages/clients/index.tsx`, `frontend/components/cards/ClientCard.tsx`

**Endpoints:** `GET /clients`, `POST /clients`, `PUT /clients/:id`, `DELETE /clients/:id`

---

## 🚀 4. PROJETOS

### Lista
- [ ] Lista projetos do usuário
- [ ] Filtros funcionam (status, cliente)
- [ ] Cards exibem informações corretas
- [ ] Grid responsivo

### Criar Projeto
- [ ] Modal abre
- [ ] Campo nome obrigatório
- [ ] Checkbox "Criar Workspace" funciona
- [ ] Checkbox "Criar Supabase DB" funciona
- [ ] Projeto criado aparece na lista
- [ ] Workspace criado quando selecionado
- [ ] Roadmap inicializado quando selecionado

### Detalhe do Projeto
- [ ] Informações do projeto exibidas
- [ ] Roadmap renderiza
- [ ] Tarefas vinculadas listadas
- [ ] Deployments listados
- [ ] Integrações GitHub/Supabase exibidas
- [ ] Botões de ação funcionam

**Arquivos:** `frontend/pages/projects/index.tsx`, `frontend/pages/projects/[id].tsx`

**Endpoints:** `GET /projects`, `POST /projects`, `POST /projects/:id/init-roadmap`

---

## ✅ 5. TAREFAS (KANBAN)

### Board
- [ ] 4 colunas exibidas (A Fazer, Em Andamento, Revisão, Concluído)
- [ ] Tarefas distribuídas nas colunas corretas
- [ ] Contador por coluna correto

### Drag & Drop
- [ ] Tarefa arrastável
- [ ] Drop em coluna válida funciona
- [ ] Status atualizado após drop
- [ ] Mudança persiste após refresh

### Criar Tarefa
- [ ] Modal abre
- [ ] Campos obrigatórios validados
- [ ] Tarefa criada aparece na coluna correta
- [ ] Prioridade exibida com badge colorido

### Editar/Deletar
- [ ] Edição funciona
- [ ] Deleção funciona com confirmação

**Arquivos:** `frontend/pages/tasks/index.tsx`

**Endpoints:** `GET /tasks`, `POST /tasks`, `POST /tasks/move`, `PUT /tasks/:id`, `DELETE /tasks/:id`

---

## 🗺️ 6. ROADMAP

### Timeline
- [ ] Timeline horizontal renderiza
- [ ] Milestones exibidos na ordem correta
- [ ] Status visual correto (cor do dot)
- [ ] Linha timeline visível

### CRUD Milestones
- [ ] Criar milestone funciona
- [ ] Editar inline funciona
- [ ] Deletar funciona
- [ ] Mudanças persistem

**Arquivos:** `frontend/pages/roadmap/index.tsx`

**Endpoints:** `GET /roadmap/get`, `POST /roadmap/create`, `PUT /roadmap/update`, `DELETE /roadmap/delete`

---

## 💻 7. WORKSPACE

### Editor
- [ ] Iframe code-server carrega
- [ ] URL configurada corretamente
- [ ] Workspace existe no banco

### Snapshots
- [ ] Lista snapshots
- [ ] Criar snapshot funciona
- [ ] Nome do snapshot exibido
- [ ] Data do snapshot exibida

### Commit & Push
- [ ] Botão abre prompt para mensagem
- [ ] Commit executado (simulado ou real)
- [ ] Feedback de sucesso/erro

**Arquivos:** `frontend/pages/workspace/[id].tsx`

**Endpoints:** `GET /workspace/get`, `POST /workspace/snapshot`, `POST /workspace/commit`

---

## 🗄️ 8. DATABASE

### Conexões
- [ ] Lista conexões Supabase
- [ ] Selecionar conexão funciona
- [ ] Conexão ativa destacada

### Tabelas
- [ ] Lista tabelas quando conexão selecionada
- [ ] Clicar tabela preenche query
- [ ] Tabela ativa destacada

### Query Editor
- [ ] Editor de texto funcional
- [ ] Templates (SELECT, INSERT, UPDATE, DELETE) funcionam
- [ ] Histórico de queries exibido
- [ ] Executar query funciona
- [ ] Resultados exibidos em tabela
- [ ] Erros exibidos corretamente
- [ ] Tempo de execução exibido

### Conectar Novo Banco
- [ ] Modal abre
- [ ] Modo OAuth funciona
- [ ] Modo URL/Key funciona
- [ ] Teste `SELECT now()` funciona
- [ ] Conexão salva

**Arquivos:** `frontend/pages/database/index.tsx`

**Endpoints:** `POST /supabase/connect`, `GET /supabase/projects`

---

## 💰 9. FINANCEIRO

### Resumo
- [ ] Cards de resumo exibem valores corretos
- [ ] Total de pagamentos correto
- [ ] Total de licenças correto
- [ ] Receita total correta

### Pagamentos
- [ ] Lista pagamentos
- [ ] Valores formatados corretamente (R$)
- [ ] Datas formatadas (pt-BR)

### Licenças
- [ ] Lista licenças
- [ ] Status exibido (ativo/inativo)
- [ ] Valores formatados

### Sincronizar Kiwify
- [ ] Botão funciona
- [ ] Loading state exibido
- [ ] Feedback de sucesso/erro
- [ ] Dados atualizados após sync

**Arquivos:** `frontend/pages/finance/index.tsx`

**Endpoints:** `GET /payments/get`, `GET /licenses/get`, `POST /finance/sync-kiwify`

---

## 🤖 10. FINCORE AI

### Resumo
- [ ] Saldo Total exibido
- [ ] Saldo por Fundo exibido
- [ ] KPIs calculados corretamente
- [ ] Gráficos de alocação renderizam

### Fundos
- [ ] Lista fundos
- [ ] Barras de progresso exibem porcentagem correta
- [ ] Valores formatados

### Simulação
- [ ] Modal de simulação abre
- [ ] Parâmetros configuráveis
- [ ] Simulação executada
- [ ] Resultados exibidos em tabela
- [ ] Runway calculado corretamente

### Insights
- [ ] Insights exibidos
- [ ] Cards coloridos por tipo (info/warning/success)
- [ ] Botão "Atualizar Insights" funciona

**Arquivos:** `frontend/pages/fincore/index.tsx`

**Endpoints:** `GET /fincore/summary`, `POST /fincore/simulate`, `GET /fincore/insights`, `POST /fincore/distribute`

---

## 📄 11. ORÇAMENTOS

### Lista
- [ ] Lista orçamentos
- [ ] Cards exibem título e valor
- [ ] Status exibido

### Criar
- [ ] Modal abre
- [ ] Campos obrigatórios validados
- [ ] JSON editor funciona
- [ ] Visualização de itens funciona
- [ ] Orçamento criado

### Enviar
- [ ] Botão "Enviar" abre modal
- [ ] Email validado
- [ ] Envio executado
- [ ] Feedback de sucesso

### Download PDF
- [ ] Botão funciona
- [ ] Arquivo gerado (simulado)

**Arquivos:** `frontend/pages/budgets/index.tsx`

**Endpoints:** `GET /budgets/get`, `POST /budgets/create`, `POST /budgets/send`

---

## 🧾 12. RECIBOS

### Lista
- [ ] Tabela exibe recibos
- [ ] Valores formatados
- [ ] Datas formatadas

### Download
- [ ] Botão "Download" funciona
- [ ] PDF gerado se não existir
- [ ] Link de download válido

### Reenviar
- [ ] Botão "Reenviar" abre prompt
- [ ] Email validado
- [ ] Reenvio executado

**Arquivos:** `frontend/pages/receipts/index.tsx`

**Endpoints:** `GET /receipts/get`, `POST /receipts/generate`

---

## 📦 13. VERSÕES

### Lista
- [ ] Tabela exibe produtos/versões
- [ ] Dados corretos (licenças vendidas, ativas, receita)

### Gráficos
- [ ] Gráfico de Licenças renderiza
- [ ] Gráfico de Receita renderiza
- [ ] Barras de progresso corretas

### Export CSV
- [ ] Botão funciona
- [ ] Arquivo CSV gerado
- [ ] Dados corretos no CSV

### Sincronizar Kiwify
- [ ] Botão funciona
- [ ] Dados atualizados

**Arquivos:** `frontend/pages/versions/index.tsx`

**Endpoints:** `GET /finance/products`, `POST /finance/sync-kiwify`

---

## 🤖 14. IA - CHAT

### Chat UI
- [ ] Mensagens exibidas
- [ ] Input funcional
- [ ] Enviar mensagem funciona
- [ ] Resposta da IA exibida

### Voz
- [ ] Botão gravar funciona
- [ ] Indicador de gravação visível
- [ ] Transcrição exibida
- [ ] TTS funciona (botão de áudio)

### Ações Rápidas
- [ ] "Criar Roadmap" funciona
- [ ] "Criar Tarefas" funciona
- [ ] Histórico de sessões exibido

**Arquivos:** `frontend/pages/ai/index.tsx`

**Endpoints:** `POST /ai/chat`, `POST /ai/stt`

---

## ⚙️ 15. CONFIGURAÇÕES

### Tema
- [ ] Toggle tema funciona
- [ ] Tema persiste em localStorage
- [ ] Aplicação reflete tema

### Integrações
- [ ] GitHub conectado exibido
- [ ] Kiwify conectado exibido
- [ ] Botões de conexão funcionam

### Variáveis por Projeto
- [ ] Lista projetos
- [ ] Variáveis exibidas
- [ ] Adicionar variável funciona
- [ ] Deletar variável funciona

### Backup
- [ ] Schedule configurável
- [ ] Salvamento funciona

### Dados Locais (Dev)
- [ ] Botão "Limpar Dados" funciona
- [ ] Confirmação antes de limpar
- [ ] Dados limpos após confirmação

**Arquivos:** `frontend/pages/settings/index.tsx`

---

## 🔒 16. SEGURANÇA (RLS)

### Row Level Security
- [ ] Usuário A não vê projetos de usuário B
- [ ] Usuário A não vê tarefas de projetos de usuário B
- [ ] Usuário A não vê fundos financeiros de usuário B
- [ ] Policies RLS ativas no Supabase

### Autenticação
- [ ] Requisições sem token retornam 401
- [ ] Token inválido rejeitado
- [ ] Token expirado rejeitado

**Arquivos:** `sql/nitronflow_schema.sql` (policies RLS)

---

## 🎨 17. UI/UX

### Design Tech
- [ ] Fundos sólidos (sem transparência excessiva)
- [ ] Cores cyan/blue aplicadas
- [ ] Cards com hover effects
- [ ] Gradientes profissionais
- [ ] Grid pattern visível no background

### Responsividade
- [ ] Mobile: sidebar colapsável (futuro)
- [ ] Mobile: grids adaptam (1 col)
- [ ] Tablet: grids adaptam (2 col)
- [ ] Desktop: layout completo

### Acessibilidade
- [ ] Contraste adequado
- [ ] Navegação por teclado funciona
- [ ] Focus visible
- [ ] Labels descritivos

**Arquivos:** `frontend/styles/globals.css`, todos os componentes

---

## 🔄 18. SINCRONIZAÇÃO

### Daemon Local
- [ ] Daemon inicia sem erros
- [ ] Monitora arquivos corretamente
- [ ] Envia patches ao salvar
- [ ] Arquivos aparecem no workspace
- [ ] Debounce funciona (não envia múltiplas vezes)

**Arquivos:** `scripts/daemon_watcher.js`

**Endpoints:** `POST /workspace/patch`

---

## 📊 19. PERFORMANCE

### Carregamento
- [ ] Páginas carregam em < 2s
- [ ] Imagens otimizadas
- [ ] Lazy loading onde apropriado

### Queries
- [ ] Queries otimizadas (índices)
- [ ] Paginação implementada onde necessário
- [ ] Cache quando apropriado

---

## 🧪 20. TESTES DE INTEGRAÇÃO

### Fluxo Completo: Criar Projeto
1. [ ] Login
2. [ ] Criar cliente
3. [ ] Criar projeto (com workspace)
4. [ ] Roadmap inicializado
5. [ ] Workspace acessível
6. [ ] Criar tarefas
7. [ ] Mover tarefas no Kanban

### Fluxo Completo: Financeiro
1. [ ] Sincronizar Kiwify
2. [ ] Pagamentos criados
3. [ ] Licenças criadas
4. [ ] Distribuir receitas (FINCORE)
5. [ ] Fundos atualizados
6. [ ] KPIs calculados

---

## ✅ CHECKLIST FINAL

- [ ] Todas as telas acessíveis
- [ ] Todos os endpoints funcionais
- [ ] RLS ativo e funcionando
- [ ] Design consistente
- [ ] Responsivo em todos os dispositivos
- [ ] Sem erros no console
- [ ] Performance adequada
- [ ] Documentação completa

---

## 📝 RELATÓRIO DE QA

Após executar todos os testes, gerar `qa_report.md` com:

- Data de execução
- Versão testada
- Testes passados/falhados
- Bugs encontrados
- Recomendações

---

**Status:** ⏳ **Aguardando Execução**

Execute este checklist e documente os resultados.

