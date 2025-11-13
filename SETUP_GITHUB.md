# Configuração do GitHub

## Passos para conectar ao GitHub

1. Acesse https://github.com/new e crie um novo repositório chamado **Nitron-Flow-Dev**
   - NÃO inicialize com README, .gitignore ou licença (já temos isso localmente)

2. Após criar o repositório, execute os seguintes comandos:

```bash
git remote add origin https://github.com/[SEU_USUARIO]/Nitron-Flow-Dev.git
git push -u origin main
```

**Nota**: Substitua `[SEU_USUARIO]` pelo seu nome de usuário do GitHub.

## Padrão de Commits

Todos os commits devem seguir o formato:
```
V[NÚMERO] DATE [DD/MM/YY] AS [HH:MM] - [Descrição]
```

Exemplo:
```
V2 DATE 13/11/25 AS 14:46 - Adicionada nova funcionalidade
```

## Comandos Úteis

- Ver status: `git status`
- Adicionar arquivos: `git add .`
- Fazer commit: `git commit -m "V[N] DATE [DATA] AS [HORA] - [Descrição]"`
- Enviar para GitHub: `git push`
- Ver histórico: `git log --oneline`

