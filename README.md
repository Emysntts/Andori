## Andori
<img src="https://github.com/user-attachments/assets/de224cb1-8150-4000-a62a-89957db4245b" alt="background_andori" />

Uma plataforma de e-learning adaptativa que utiliza Inteligência Artificial generativa para transformar qualquer matéria escolar em lições personalizadas e envolventes, adaptadas aos interesses e hiperfocos de estudantes neurodivergentes — com foco inicial em crianças do Ensino Fundamental I, especialmente com Transtorno do Espectro Autista (TEA).

## Contexto e Propósito
O cenário educacional brasileiro enfrenta desafios crescentes na inclusão e equidade.
Na Paraíba, o número de alunos público-alvo da educação especial cresceu de 15 mil (2015) para 39 mil (2023), e o número de estudantes com TEA nas escolas brasileiras saltou de 41 mil para 884 mil em menos de uma década.

Esses [dados](https://download.inep.gov.br/publicacoes/institucionais/estatisticas_e_indicadores/resumo_tecnico_censo_escolar_2024.pdf) evidenciam a necessidade de soluções que apoiem professores e escolas no processo de inclusão, reduzindo evasão e ampliando engajamento e compreensão.

### Ideia (MVP)
- **O que é**: Plataforma que gera materiais pedagógicos personalizados (resumos, roteiros e questões) com base nos objetivos de aprendizagem definidos pelo educador e nos interesses/hiperfocos dos alunos (ex.: dinossauros, trens, espaço, planetas).
- **Como funciona**
O professor cria suas aulas na plataforma e obtém materiais adaptados automaticamente à realidade de cada turma — integrando o ensino tradicional com práticas inclusivas.
- **Objetivo**
Simplificar a rotina docente e oferecer uma forma intuitiva, prática e humanizada de incluir cada aluno em seu próprio ritmo, sem comprometer o fluxo pedagógico coletivo.
- **Papéis principais**:
  - **Familiar/Responsável**: informa hiperfoco, nível de suporte, preferências cognitivas e observações.
  - **Educador/Professor**: define objetivos/habilidades e gera materiais revisáveis e publicáveis.


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
- [ ] Dashboard do coordenador (turmas, professores, disciplinas).

## Organização e referências
- Estrutura de diretórios organizada por serviços: `backend/`, `frontend/`.
- Veja também:
  - `backend/app/api/v1/` para rotas da API.
  - `frontend/app/` para rotas do Next.js.
  - `frontend/components/` para componentes reutilizáveis.
