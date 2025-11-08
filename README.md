Andori

Ideia (MVP)
- Plataforma de e-learning adaptativa que usa IA generativa para traduzir qualquer matéria escolar em lições personalizadas a partir do hiperfoco/interesses de estudantes neurodivergentes (ex.: dinossauros, trens, espaço).
- Três papéis principais:
  - Familiar/Responsável: informa hiperfoco, nível de suporte, preferências cognitivas e observações.
  - Coordenador pedagógico: cadastra dados acadêmicos (turma, professores, disciplinas).
  - Educador/Professor: define objetivo/habilidade da aula e gera materiais (resumos e questões) revisáveis e publicáveis.
- Objetivo: unir o tradicional e a inclusão, oferecendo materiais acessíveis e personalizados para melhorar a aprendizagem e reduzir a evasão.

Contexto
- O número de estudantes com TEA no Brasil saltou nos últimos anos, exigindo soluções escaláveis que apoiem escolas públicas.
- O foco é criar algo implementável no dia a dia da escola, com clareza, impacto e aplicação real de IA.

Arquitetura (sem código)
- Backend: FastAPI + SQLAlchemy + Supabase (PostgreSQL).
- Frontend: Next.js + React + TypeScript + Tailwind + shadcn/ui.
- Organização de pastas em `backend/`, `frontend/` e `docs/` para acelerar o desenvolvimento do MVP.

Mais detalhes
- Estrutura de diretórios: veja `backend/README.md` e `frontend/README.md`.
- Modelo de dados: veja `docs/DB_SCHEMA.md`.