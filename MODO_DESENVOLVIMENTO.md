# 🛠️ Modo de Desenvolvimento

## ✅ O que foi implementado

O sistema agora possui um **modo de desenvolvimento** que permite:

- ✅ **Login com qualquer email e senha** (sem precisar configurar Supabase)
- ✅ **Acesso completo ao sistema** durante desenvolvimento local
- ✅ **Sessão persistente** no localStorage
- ✅ **Ativação automática** quando em `localhost`

---

## 🚀 Como usar

### 1. Acesse a tela de login

Abra: `http://localhost:3000/auth/login`

### 2. Digite qualquer email e senha

**Exemplos:**
- Email: `dev@teste.com` / Senha: `qualquercoisa`
- Email: `admin@local` / Senha: `123456`
- Email: `teste@teste.com` / Senha: `senha`

**Qualquer combinação funciona!**

### 3. Clique em "Entrar"

O sistema vai:
- Criar uma sessão fake no localStorage
- Redirecionar para o dashboard
- Permitir acesso a todas as páginas

---

## 📋 Detalhes Técnicos

### Quando o modo dev está ativo?

- ✅ Automaticamente quando está em `localhost` ou `127.0.0.1`
- ✅ Quando `NEXT_PUBLIC_DEV_MODE=true` no `.env.local`
- ✅ Quando Supabase **não está configurado**

### O que acontece?

1. **Login:** Cria uma sessão fake no `localStorage`
2. **Autenticação:** Bypassa verificação de Supabase
3. **API Requests:** Retorna dados mockados ou permite requisições sem auth real
4. **Header:** Mostra o email digitado no login

### Sessão Dev

A sessão é armazenada em:
- `localStorage.getItem('nitronflow_dev_session')`
- Expira em 24 horas
- Pode ser limpa com logout

---

## ⚠️ Importante

### Modo Dev vs Produção

- **Modo Dev:** Ativo apenas em `localhost` sem Supabase configurado
- **Produção:** Requer Supabase configurado e autenticação real

### Segurança

- ⚠️ **NUNCA** use modo dev em produção
- ⚠️ O modo dev **não funciona** em domínios reais
- ⚠️ Use apenas para desenvolvimento local

---

## 🔄 Logout

Para sair:
1. Clique em "Sair" no header
2. A sessão dev será limpa
3. Você será redirecionado para o login

---

## ✅ Benefícios

- ✅ **Desenvolvimento rápido** sem precisar configurar Supabase
- ✅ **Testes locais** sem dependências externas
- ✅ **Prototipagem** de interfaces sem backend
- ✅ **Demonstrações** rápidas do sistema

---

## 📝 Exemplo de Uso

```bash
# 1. Inicie o servidor
cd frontend
npm run dev

# 2. Acesse
http://localhost:3000/auth/login

# 3. Digite qualquer email/senha
Email: dev@teste.com
Senha: qualquercoisa

# 4. Pronto! Você está logado!
```

---

## 🎯 Próximos Passos

Quando quiser usar o sistema completo:
1. Configure o Supabase (veja `CONFIGURAR_SUPABASE.txt`)
2. O modo dev será desativado automaticamente
3. Use autenticação real do Supabase

---

**Modo de desenvolvimento ativo e funcionando!** 🚀

