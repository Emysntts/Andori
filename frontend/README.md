Andori — Frontend

Stack alvo: Next.js (app router) + React + TypeScript + Tailwind + shadcn/ui.

Estrutura de diretórios proposta:

- app/                     → rotas do Next.js (server/client components)
- components/
  - ui/                    → componentes base (shadcn/ui personalizados)
  - common/                → componentes compartilhados
- features/
  - student-profile/       → telas e lógica de perfis de estudantes
  - lesson-generation/     → telas e lógica de geração de materiais
  - classroom/             → telas de turmas/aulas
- lib/                     → utilitários (fetchers, formatadores, config)
- hooks/                   → hooks reutilizáveis
- contexts/                → contextos globais
- styles/                  → estilos globais/tokens
- public/                  → assets estáticos
- tests/                   → testes

Observações
- Sem código neste momento: apenas organização para acelerar o MVP.
- Integração com backend via API REST (FastAPI).


