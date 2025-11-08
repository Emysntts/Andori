Arquitetura — Andori 

Objetivo
Plataforma de e-learning adaptativa que usa IA para transformar o hiperfoco/interesses de estudantes neurodivergentes em materiais personalizados (resumos e questões), apoiando familiares, coordenadores e professores.

Camadas
- Frontend (Next.js/React/TS/Tailwind/shadcn)
  - app/ (rotas, server/client components)
  - components/ (ui e comuns)
  - features/ (student-profile, lesson-generation, classroom)
  - lib/, hooks/, contexts/, styles/, public/, tests/
  - Consome a API do backend para CRUD de entidades e geração de conteúdo.

- Backend (FastAPI + SQLAlchemy + Supabase)
  - app/api/v1/ (routes, dependencies)
  - core/ (config, middlewares, segurança)
  - db/ (sessão, conexão)
  - models/ e schemas/ (ORM e contratos)
  - repositories/ (CRUD)
  - services/ (negócio e integrações, ex.: IA)
  - workers/ (tarefas assíncronas)
  - tests/, scripts/
  - Expõe endpoints para cadastro/consulta (estudantes, turmas, etc.) e para geração de resumos/questões com auditoria (geracoes_ia).

- Dados (Supabase/PostgreSQL)
  - Tabelas conforme docs/DB_SCHEMA.md
  - Rastreamento de gerações de IA em geracoes_ia para reprodutibilidade.

Fluxo de uso (simplificado)
1) Familiar adiciona perfil do estudante (hiperfoco, preferências, observações).
2) Coordenador registra dados acadêmicos (turma, professores, disciplinas).
3) Professor define objetivo/habilidade e solicita geração de materiais.
4) Backend chama serviço de IA e registra auditoria em geracoes_ia.
5) Materiais (resumos/questões) são salvos e vinculados ao estudante/turma.
6) Professor revisa e publica materiais para uso em aula.

Princípios
- Foco no aprendizado do estudante e adoção pelo Governo.
- Simplicidade para o professor e apoio do pedagogo.
- Auditoria e segurança de dados (registro de gerações e acesso mínimo necessário).


