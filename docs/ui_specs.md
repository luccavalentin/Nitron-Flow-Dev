# UI Specs - NitronFlow Dev

Especificações detalhadas de interface, componente por componente.

## Design System

### Cores

**Paleta Tech Professional:**
- Background: `#0a0e1a` (slate-950)
- Foreground: `#e2e8f0` (slate-200)
- Primary: `#00d4ff` (cyan-500)
- Accent: `#0066ff` (blue-600)
- Success: `#00ff88` (green-500)
- Warning: `#ffb800` (yellow-500)
- Error: `#ff3366` (red-500)

### Tipografia

- Font Family: `Inter` (Google Fonts)
- Títulos: `font-bold`, `gradient-text` (gradiente cyan-blue)
- Corpo: `text-slate-200` / `text-slate-400`
- Tamanhos: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`

### Componentes Base

#### Card Modern
```css
.card-modern {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.card-modern:hover {
  background: rgba(15, 23, 42, 1);
  border-color: var(--primary);
  box-shadow: 0 12px 24px -3px rgba(0, 0, 0, 0.5);
  transform: translateY(-3px);
}
```

#### Botões

**Primário (Ação Principal):**
```css
bg-gradient-to-r from-cyan-500 to-blue-600
hover:from-cyan-600 hover:to-blue-700
shadow-lg shadow-cyan-500/30
```

**Secundário:**
```css
bg-slate-700 text-slate-200
hover:bg-slate-600
```

#### Inputs
```css
bg-slate-800 border border-slate-700
text-slate-200
focus:ring-2 focus:ring-cyan-500
```

---

## Telas Detalhadas

### 1. Login (`/auth/login`)

**Layout:**
- Container centralizado vertical e horizontalmente
- Card com `card-modern` e `tech-border`
- Logo "NF" com gradiente cyan-blue
- Título com `gradient-text`

**Componentes:**
- Input email: `bg-slate-800`, `text-slate-200`
- Input senha: `bg-slate-800`, `text-slate-200`
- Botão Entrar: gradiente cyan-blue
- Botão GitHub: `bg-white` com ícone
- Link "Esqueci senha": `text-cyan-400`

**Estados:**
- Loading: spinner animado
- Erro: mensagem vermelha abaixo do formulário
- Sucesso: redirecionamento para `/dashboard`

**Responsividade:**
- Mobile: padding reduzido, largura máxima 90vw

---

### 2. Dashboard (`/dashboard`)

**Layout:**
- Grid de cards de resumo (4 colunas no desktop, 1 no mobile)
- Gráficos (Receita, Tarefas por Status, Projetos por Status)
- Feed de atividades
- Ações rápidas

**Cards de Resumo:**
- Background: `card-modern`
- Ícone: gradiente cyan-blue em círculo
- Valor: `text-cyan-400` / `text-blue-400` / `text-green-400`
- Descrição: `text-slate-500`

**Gráficos:**
- Container: `card-modern p-5`
- Título: `text-sm font-medium text-slate-300`
- Gráfico: Recharts com cores do tema

**Feed de Atividades:**
- Lista vertical com scroll
- Item: `bg-slate-800 border border-slate-700`
- Hover: `hover:bg-slate-700 hover:border-cyan-500/50`

---

### 3. Sidebar (`components/layout/Sidebar`)

**Layout:**
- Fixo à esquerda, largura `w-64`
- Background: `bg-slate-900` (sólido)
- Border: `border-r border-slate-800`

**Logo:**
- Container: `bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600`
- Texto: "NF" em branco
- Indicador: ponto verde pulsante

**Menu Items:**
- Active: `bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-cyan-600/30`
- Active border: `border-l-2 border-cyan-500`
- Active text: `text-cyan-300`
- Inactive: `text-slate-300`
- Hover: `hover:bg-slate-800 hover:text-cyan-300`

**Estados:**
- Active: gradiente de fundo + borda esquerda cyan
- Hover: background slate-800
- Loading: skeleton loader

---

### 4. Header (`components/layout/Header`)

**Layout:**
- Sticky top, `z-50`
- Background: `bg-slate-900`
- Border: `border-b border-slate-800`

**Componentes:**
- Indicador "Sistema Online": ponto verde pulsante
- Toggle tema: ícone sol/lua
- Avatar usuário: iniciais em círculo com gradiente
- Email: `text-slate-200`

---

### 5. Projetos - Lista (`/projects`)

**Layout:**
- Grid responsivo: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Gap: `gap-4`

**ProjectCard:**
- Container: `card-modern`
- Título: `text-slate-200 font-semibold`
- Status badge: cores por status
- Ações: botões com ícones

**Modal Criar:**
- Overlay: `bg-black/70 backdrop-blur-sm`
- Container: `card-modern`
- Inputs: `bg-slate-800`
- Botões: gradiente (salvar) / slate (cancelar)

---

### 6. Tarefas - Kanban (`/tasks`)

**Layout:**
- Flex horizontal com scroll
- Colunas: `w-80` cada
- Container coluna: `card-modern p-4`

**Colunas:**
- Header: `text-slate-200 font-semibold`
- Contador: `text-slate-500`

**Task Card:**
- Container: `bg-slate-800 border border-slate-700`
- Hover: `hover:bg-slate-700 hover:border-cyan-500/50`
- Título: `text-slate-200`
- Prioridade badge: cores por prioridade
- Draggable: cursor move

**Drag & Drop:**
- Drag over: `bg-slate-800/50`
- Visual feedback durante drag

---

### 7. Workspace (`/workspace/[id]`)

**Layout:**
- Iframe fullscreen para code-server
- Toolbar superior: botões Snapshot e Commit
- Painel inferior: lista de snapshots

**Toolbar:**
- Background: `bg-slate-900`
- Botões: gradiente cyan-blue

**Snapshots:**
- Container: `bg-slate-800 border border-slate-700`
- Hover: `hover:bg-slate-700 hover:border-cyan-500/50`

---

### 8. Database (`/database`)

**Layout:**
- Grid: `lg:grid-cols-4`
- Sidebar esquerda: conexões e tabelas
- Área principal: query editor

**Query Editor:**
- Textarea: `bg-slate-900 font-mono`
- Botões templates: `bg-slate-800 border border-slate-700`
- Botão executar: gradiente cyan-blue

**Resultados:**
- Tabela: `bg-slate-900`
- Header: `bg-slate-800`
- Rows: `hover:bg-slate-800/50`

---

### 9. FINCORE AI (`/fincore`)

**Layout:**
- Cards KPI: grid 4 colunas
- Fundos: lista com barras de progresso
- Insights: cards coloridos por tipo

**Cards KPI:**
- Valor: `text-3xl font-bold` com cor específica
- Label: `text-slate-500`

**Fundos:**
- Item: `bg-slate-800 border border-slate-700`
- Barra progresso: gradiente cyan-blue
- Valor: `text-cyan-400`

---

### 10. Orçamentos (`/budgets`)

**Layout:**
- Grid de cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**BudgetCard:**
- Título: `text-slate-200`
- Valor: `text-3xl font-bold text-green-400`
- Botões: gradiente (download) / verde (enviar)

**Modal Criar:**
- JSON Editor: `bg-slate-900 font-mono`
- Toggle visualizar/editar JSON

---

### 11. Recibos (`/receipts`)

**Layout:**
- Tabela responsiva com scroll horizontal

**Tabela:**
- Header: `bg-slate-800`
- Rows: `hover:bg-slate-800/50`
- Valores: `text-green-400 font-semibold`

**Ações:**
- Download: gradiente cyan-blue
- Reenviar: `bg-slate-700`

---

### 12. Versões (`/versions`)

**Layout:**
- Tabela principal
- Gráficos abaixo (2 colunas)

**Gráficos:**
- Barras de progresso horizontais
- Cores: cyan (licenças), green (receita)

---

### 13. Roadmap (`/roadmap`)

**Layout:**
- Timeline vertical com linha central
- Milestones: cards com dot na timeline

**Timeline:**
- Linha: `bg-slate-700` vertical
- Dot: círculo colorido por status
- Card: `card-modern`

**Estados:**
- Planned: `bg-gray-500`
- In Progress: `bg-blue-500`
- Completed: `bg-green-500`

---

### 14. IA - Chat (`/ai`)

**Layout:**
- Container chat: `card-modern`
- Mensagens: bubbles alternadas
- Input: textarea com botões de ação

**Mensagens:**
- User: `bg-slate-800`
- Assistant: `bg-slate-700`
- Texto: `text-slate-200`

**Ações:**
- Gravar voz: botão com ícone microfone
- Enviar: gradiente cyan-blue
- Ações rápidas: "Criar Roadmap", "Criar Tarefas"

---

### 15. Configurações (`/settings`)

**Layout:**
- Seções verticais: `card-modern p-5`
- Título seção: `text-sm font-medium text-slate-300`

**Formulários:**
- Inputs: `bg-slate-800`
- Selects: `bg-slate-800`
- Botões: gradiente (salvar) / slate (cancelar)

---

## Estados e Interações

### Loading States
- Spinner: componente `LoadingSpinner`
- Skeleton: cards com animação shimmer
- Texto: "Carregando..." em `text-slate-400`

### Error States
- Mensagem: `bg-red-900/20 border border-red-800 text-red-400`
- Container: `card-modern` com borda vermelha

### Empty States
- Container: `card-modern p-12 text-center`
- Mensagem: `text-slate-400`
- Botão ação: gradiente cyan-blue

### Success States
- Feedback: toast notification (futuro)
- Mensagem: `text-green-400`

---

## Responsividade

### Breakpoints (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Mobile First
- Grids: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`
- Sidebar: colapsável em mobile (futuro)
- Padding: reduzido em mobile

---

## Acessibilidade

### Contraste
- Texto principal: mínimo 4.5:1
- Texto secundário: mínimo 3:1

### Navegação por Teclado
- Tab order lógico
- Focus visible: `ring-2 ring-cyan-500`
- Skip links (futuro)

### Screen Readers
- Labels descritivos
- ARIA attributes onde necessário
- Alt text em imagens

---

## Animações

### Transições
- Duração padrão: `transition-all duration-200`
- Hover: `hover:scale-1.02` em cards
- Loading: `animate-spin` em spinners

### Framer Motion
- Page transitions: fade in
- List items: stagger children
- Modals: scale + fade

---

## Componentes Reutilizáveis

### LoadingSpinner
- Tamanhos: `sm`, `md`, `lg`
- Cor: cyan-400

### Modal
- Overlay: `bg-black/70 backdrop-blur-sm`
- Container: `card-modern`
- Fechar: botão X ou ESC

### Badge
- Status: cores por tipo
- Prioridade: cores por nível

---

## Padrões de Código

### Estrutura de Componente
```tsx
export default function Component() {
  // Hooks
  // Handlers
  // Render
  return (
    <div className="...">
      {/* Content */}
    </div>
  )
}
```

### Naming
- Componentes: PascalCase
- Arquivos: kebab-case
- Classes: Tailwind utilities

---

## Notas de Implementação

- Todos os componentes devem ser dark-first
- Usar `card-modern` para containers principais
- Gradientes apenas em elementos de destaque
- Manter consistência de espaçamento (`gap-4`, `p-5`)
- Sempre incluir estados de loading e erro

