## Andori

E-learning adaptativo para traduzir qualquer matéria escolar em lições personalizadas a partir do hiperfoco de estudantes neurodivergentes.

<img src="frontend/public/Frame 1 1.png" alt="Andori background" width="50%" />

### Ideia (MVP)
- **O que é**: plataforma que usa IA generativa para produzir resumos e questões alinhados a objetivos de aprendizagem, adaptando linguagem e contexto ao hiperfoco do estudante (ex.: dinossauros, trens, espaço).
- **Papéis principais**:
  - **Familiar/Responsável**: informa hiperfoco, nível de suporte, preferências cognitivas e observações.
  - **Educador/Professor**: define objetivos/habilidades e gera materiais revisáveis e publicáveis.
- **Objetivo**: unir práticas tradicionais e inclusão, reduzindo evasão e aumentando engajamento e compreensão.

### Contexto
- Cresce o número de estudantes com TEA no Brasil, demandando soluções escaláveis que apoiem escolas públicas.

## Identidade visual
- **Paleta (Tailwind `andori` + `brand`)**
  - andori.pink `#F995AD`
  - andori.paper `#FFFEF1`
  - andori.cream `#FFF1C4`
  - andori.sand `#FFE496`
  - andori.gold `#FFCA3A`
  - andori.blue `#2857A4`
  - andori.sky `#58B4EE`
  - andori.navy `#01162A`
  - brand (50 → 900) com base em `#f7b800` (dourado)
- **Estilo**: foco em legibilidade, superfícies claras, cantos arredondados e contraste alto para acessibilidade.
- **Texturas/Imagem**: uso de papel claro e elementos lúdicos; imagem de fundo em `frontend/public/background.png`.

## Ferramentas e stack
- **Frontend**
  - Next.js `14.2.3`
  - React `18.2.0`
  - TypeScript `5.4.5`
  - Tailwind CSS `3.4.3`
  - Recharts, react-day-picker
- **Backend**
  - FastAPI `0.115.0`
  - Uvicorn `0.30.6`
  - Pydantic `2.9.2`
  - SQLAlchemy `2.0.36`
  - Psycopg `3.2.12`
  - HTTPX `0.27.2`
- **Banco de dados**
  - PostgreSQL (Supabase)

## Arquitetura (alto nível)
- Backend: FastAPI + SQLAlchemy + PostgreSQL (Supabase).
- Frontend: Next.js + React + TypeScript + Tailwind.
- Documentos úteis:
  - Arquitetura: `docs/ARCHITECTURE.md`
  - Modelo de dados: `docs/DB_SCHEMA.md`
  - Mais detalhes: `backend/README.md` e `frontend/README.md`

## Próximos passos (roadmap)
- [ ] Fluxo completo de geração de lição (resumo + questões) com revisão e publicação.
- [ ] Perfis e autenticação por papel (Familiar, Coordenador, Educador).
- [ ] Dashboard do coordenador (turmas, professores, disciplinas).
- [ ] Publicação de materiais e trilhas por turma/aluno.
- [ ] Acessibilidade (WCAG): foco/teclado, contraste, leitura simplificada.
- [ ] Telemetria básica (logs, métricas) e monitoramento de custos de IA.
- [ ] Testes E2E (Playwright/Cypress) e integração (pytest + HTTPX).
- [ ] Deploy (preview + produção) e configuração de variáveis seguras.

## Organização e referências
- Estrutura de diretórios organizada por serviços: `backend/`, `frontend/`, `docs/`.
- Veja também:
  - `backend/app/api/v1/` para rotas da API.
  - `frontend/app/` para rotas do Next.js.
  - `frontend/components/` para componentes reutilizáveis.
