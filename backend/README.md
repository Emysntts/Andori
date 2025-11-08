Andori — Backend

Estrutura de diretórios proposta (FastAPI + SQLAlchemy + Supabase):

- app/
  - api/
    - v1/
      - routes/           → agrupamento de rotas
      - dependencies/     → dependências de rota (auth, sessão, etc.)
  - core/                 → config, constantes, middlewares, segurança
  - db/                   → conexão, sessão, utilitários de banco
  - models/               → modelos ORM (SQLAlchemy)
  - schemas/              → contratos de entrada/saída (Pydantic)
  - services/             → regras de negócio e integrações (ex.: IA)
  - repositories/         → persistência/CRUD
  - workers/              → tarefas assíncronas/background
- scripts/                → utilitários de manutenção/migrações
- tests/                  → testes

Observações
- Sem código neste momento: apenas organização para acelerar o MVP.
- Banco: PostgreSQL (Supabase), com SQLAlchemy para ORM.
- IA: serviços sob app/services (ex.: geração de resumos/questões).


