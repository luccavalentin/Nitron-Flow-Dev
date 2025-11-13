# 🛠️ Configuração do Workspace e Code-Server

## 📋 Visão Geral

O workspace permite editar código diretamente no navegador usando `code-server` (VSCode Web). As mudanças são sincronizadas automaticamente com o Supabase Storage.

---

## 🚀 Configuração do Code-Server

### Opção 1: Instalação Local (Recomendado para Desenvolvimento)

#### Windows:

1. **Instale o code-server:**
   ```bash
   # Via npm (requer Node.js)
   npm install -g code-server
   
   # OU via Scoop
   scoop install code-server
   ```

2. **Inicie o code-server:**
   ```bash
   code-server --bind-addr 0.0.0.0:8080 --auth none
   ```

3. **Acesse:** `http://localhost:8080`

#### Linux/Mac:

1. **Instale via script:**
   ```bash
   curl -fsSL https://code-server.dev/install.sh | sh
   ```

2. **Inicie o code-server:**
   ```bash
   code-server --bind-addr 0.0.0.0:8080 --auth none
   ```

3. **Acesse:** `http://localhost:8080`

---

### Opção 2: Docker (Alternativa)

```bash
docker run -it --name code-server -p 8080:8080 \
  -v "$PWD:/home/coder/project" \
  -u "$(id -u):$(id -g)" \
  -e "DOCKER_USER=$USER" \
  codercom/code-server:latest \
  --bind-addr 0.0.0.0:8080 \
  --auth none
```

---

## ⚙️ Configuração no NitronFlow Dev

### 1. Criar um Workspace

1. Acesse a página de um projeto
2. Clique em "Abrir Workspace"
3. O sistema criará um workspace no Supabase Storage

### 2. Configurar Code-Server

O code-server deve estar rodando em `http://localhost:8080` (ou configure a URL no código).

### 3. Sincronização Automática

O daemon de sincronização monitora mudanças locais e envia para o workspace:

```bash
# No diretório do projeto
node scripts/daemon_watcher.js <workspaceId> <caminho-do-projeto>
```

---

## 🔄 Daemon de Sincronização

### Configuração

1. **Instale as dependências:**
   ```bash
   cd scripts
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   export API_URL=https://seu-projeto.supabase.co/functions/v1
   export SUPABASE_TOKEN=seu_token_aqui
   ```

3. **Execute o daemon:**
   ```bash
   node daemon_watcher.js <workspaceId> <caminho-do-projeto>
   ```

### Funcionalidades

- ✅ Monitora mudanças em arquivos
- ✅ Sincroniza automaticamente com o workspace
- ✅ Ignora `node_modules`, `.git`, etc.
- ✅ Debounce de 500ms para evitar muitas requisições

---

## 📸 Snapshots

### Criar Snapshot

1. No workspace, clique em "Criar Snapshot"
2. Digite um nome descritivo
3. O sistema criará um backup completo do workspace

### Restaurar Snapshot

1. Visualize os snapshots na parte inferior do workspace
2. Clique em um snapshot para restaurar (funcionalidade futura)

---

## 🔐 Commit e Push

### Commit Manual

1. No workspace, clique em "Commit & Push"
2. Digite a mensagem do commit
3. O sistema fará commit e push para o GitHub

### Formato de Commit

O sistema usa o formato padrão:
```
V[NUMBER] DATE [DATE] AS [TIME] - [MENSAGEM]
```

---

## 🐛 Troubleshooting

### Code-Server não carrega

- Verifique se o code-server está rodando: `http://localhost:8080`
- Verifique o console do navegador para erros
- Certifique-se de que a porta 8080 não está em uso

### Sincronização não funciona

- Verifique se o daemon está rodando
- Verifique as variáveis de ambiente (`API_URL`, `SUPABASE_TOKEN`)
- Verifique os logs do daemon

### Erro de permissão

- Certifique-se de que o usuário tem permissão para acessar o workspace
- Verifique as políticas RLS no Supabase

---

## 📚 Recursos

- [Documentação do Code-Server](https://coder.com/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Chokidar (File Watcher)](https://github.com/paulmillr/chokidar)

---

## ✅ Checklist de Configuração

- [ ] Code-server instalado e rodando
- [ ] Workspace criado no projeto
- [ ] Daemon de sincronização configurado (opcional)
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de edição de arquivo funcionando
- [ ] Teste de snapshot funcionando
- [ ] Teste de commit funcionando

