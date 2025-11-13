# 🚀 EXECUTAR AGORA - Visualizar o Projeto

## ⚡ PASSO A PASSO RÁPIDO

### 1️⃣ Configure o Supabase (5 minutos)

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No **SQL Editor**, execute o arquivo: `sql/nitronflow_schema.sql`
3. No **Storage**, crie os buckets:
   - `workspaces`
   - `snapshots`
   - `receipts`
   - `ai-uploads`
   - `backups`

### 2️⃣ Configure as Variáveis (2 minutos)

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

**Onde encontrar:**
- Supabase Dashboard → Settings → API
- Copie a "Project URL" e "anon public" key

### 3️⃣ Execute o Projeto (1 minuto)

**Windows:**
```bash
scripts\start-local.bat
```

**Linux/Mac:**
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Acesse no Navegador

Abra: **http://localhost:3000**

---

## ✅ O QUE VOCÊ VERÁ

- ✅ Tela de login
- ✅ Dashboard com resumo
- ✅ Página de projetos (criar, listar, editar)
- ✅ Página de clientes (criar, listar, editar)
- ✅ Kanban de tarefas (drag & drop)
- ✅ Módulo financeiro
- ✅ FINCORE AI
- ✅ Banco de dados
- ✅ Configurações

---

## 🐛 SE DER ERRO

1. **Erro de conexão:**
   - Verifique se o `.env.local` está correto
   - Verifique se o Supabase está ativo

2. **Erro de dependências:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Erro de porta:**
   - A porta 3000 está em uso? Use outra: `npm run dev -- -p 3001`

---

## 📊 STATUS ATUAL

✅ **39 versões implementadas**
✅ **30+ Edge Functions**
✅ **15+ páginas funcionais**
✅ **Sistema completo e operacional**

---

**🎯 Agora você pode ver tudo funcionando localmente!**

