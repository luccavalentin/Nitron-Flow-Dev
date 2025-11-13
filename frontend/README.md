# Frontend - NitronFlow Dev

## Execução Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz da pasta `frontend`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
```

### 3. Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm start
```

### 4. Acessar

Abra `http://localhost:3000` no navegador

## Estrutura

- `/pages` - Páginas do Next.js
- `/components` - Componentes reutilizáveis
- `/lib` - Bibliotecas e helpers
- `/styles` - Estilos globais

## Tecnologias

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase Client

