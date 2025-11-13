# 🚀 Como Iniciar o Projeto Localmente

## Método Rápido (Windows)

1. **Execute o script:**
   ```bash
   scripts\start-local.bat
   ```

2. **Configure o .env.local** (se solicitado):
   - Abra `frontend/.env.local`
   - Preencha com suas credenciais do Supabase

3. **Acesse:**
   - Abra `http://localhost:3000` no navegador

## Método Manual

### 1. Configure Variáveis de Ambiente

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

**Onde encontrar as credenciais:**
- Acesse seu projeto no Supabase
- Vá em Settings > API
- Copie a URL e a anon key

### 2. Instale Dependências

```bash
cd frontend
npm install
```

### 3. Execute o Projeto

```bash
npm run dev
```

### 4. Acesse no Navegador

Abra: **http://localhost:3000**

## ⚠️ Importante

- Certifique-se de que o Supabase está configurado (veja `docs/DEPLOY.md`)
- O projeto precisa das Edge Functions deployadas ou usar Supabase CLI local
- Se houver erros, verifique o console do navegador e o terminal

## 🐛 Problemas Comuns

**Erro: "Variáveis de ambiente não configuradas"**
- Verifique se o arquivo `.env.local` existe em `frontend/`
- Verifique se as variáveis estão corretas

**Erro: "Cannot connect to Supabase"**
- Verifique se a URL do Supabase está correta
- Verifique sua conexão com a internet

**Porta 3000 já em uso:**
- Feche outros processos usando a porta 3000
- Ou use: `npm run dev -- -p 3001`

