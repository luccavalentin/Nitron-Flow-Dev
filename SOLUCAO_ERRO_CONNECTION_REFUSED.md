# 🔧 SOLUÇÃO: ERR_CONNECTION_REFUSED

## ⚠️ PROBLEMA

Você está vendo: **"localhost se recusou a se conectar"**

Isso significa que o servidor Next.js **NÃO está rodando**.

---

## ✅ SOLUÇÃO PASSO A PASSO

### PASSO 1: Abra o Terminal/Git Bash

No Windows:
- Pressione `Win + R`
- Digite `cmd` ou `powershell`
- Pressione Enter
- OU use Git Bash

### PASSO 2: Navegue até a pasta do projeto

```bash
cd C:\Users\lucca\Downloads\zero\frontend
```

### PASSO 3: Verifique se node_modules existe

```bash
dir node_modules
```

Se não existir, instale:
```bash
npm install
```

### PASSO 4: Execute o servidor

```bash
npm run dev
```

**AGUARDE** até ver:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  ✓ Ready in 2.3s
```

### PASSO 5: Mantenha o terminal aberto

**⚠️ IMPORTANTE:** Não feche o terminal! O servidor precisa ficar rodando.

### PASSO 6: Abra no navegador

Abra: **http://localhost:3000**

---

## 🐛 SE AINDA DER ERRO

### Erro: "Port 3000 already in use"

Alguém já está usando a porta 3000. Use outra porta:

```bash
npm run dev -- -p 3001
```

Depois acesse: **http://localhost:3001**

### Erro: "Cannot find module"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erro: "Missing .env.local"

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

**Mesmo sem o .env.local, o sistema vai iniciar!** (só não vai conectar ao Supabase)

---

## 📋 COMANDOS COMPLETOS (COPIE E COLE)

```bash
cd C:\Users\lucca\Downloads\zero\frontend
npm install
npm run dev
```

**Mantenha o terminal aberto!**

Depois abra: **http://localhost:3000**

---

## ✅ RESULTADO ESPERADO

Você verá:
- ✅ Tela de login do NitronFlow Dev
- ✅ Interface completa e funcional
- ✅ Todas as páginas acessíveis

---

## ⚠️ LEMBRE-SE

**O terminal DEVE ficar aberto enquanto você usa o sistema!**

Se fechar o terminal, o servidor para e você verá o erro novamente.

