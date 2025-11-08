Andori — Frontend

Stack: Next.js (App Router) + React + TypeScript + Tailwind.

Estrutura (essencial):

- app/                     → rotas e páginas
- components/              → componentes compartilhados (Tabs, Cards)
- app/aluno/[id]/          → página de perfil do aluno
- app/aulas/               → página de aulas
- app/globals.css          → Tailwind base
- tailwind.config.ts / postcss.config.js / tsconfig.json

Como rodar
1) Instale as dependências:
   npm install
2) Ambiente:
   - Opcional: crie frontend/.env.local, se necessário.
3) Dev:
   npm run dev

Páginas implementadas (MVP visual)
- /           → turmas com cartões de alunos
- /aulas      → calendário (placeholder) e lista de aulas, botão “add aula”
- /aluno/:id  → perfil do aluno com desempenho e lista de aulas/relatórios

Notas
- UI simples e sem emoji, inspirada nos wireframes.
- Dados mock in-memory; substitua por chamadas ao backend quando pronto.


