CREATE TABLE IF NOT EXISTS public.alunos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                     TEXT NOT NULL,
  turma_id                 UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  -- inputs 
  interesse TEXT, 
  preferencia TEXT, 
  dificuldade TEXT,
  laudo TEXT,
  observacoes TEXT,
  nivel_de_suporte TEXT -- baixo, medio, alto
  

   descricao_do_aluno TEXT -- pelo professor
);

-- 2.1 Turmas (depende de coordenadores)
CREATE TABLE IF NOT EXISTS public.turmas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL,          -- ex.: '6ºA'
);

CREATE TABLE IF NOT EXISTS public.professores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.turmas_professores (
  turma_id      UUID NOT NULL REFERENCES public.turmas(id)      ON DELETE CASCADE,
  professor_id  UUID NOT NULL REFERENCES public.professores(id) ON DELETE RESTRICT,
  UNIQUE (turma_id),
  PRIMARY KEY (turma_id, professor_id)
);


CREATE TABLE IF NOT EXISTS public.arrmd (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina       TEXT,
  assunto          TEXT,
  descricao        TEXT,
  upload_arquivo   JSONB,
  feedback_material TEXT,
  turma_id         UUID,  -- deixe NULL por enquanto; torne NOT NULL após preencher
);

CREATE TABLE IF NOT EXISTS public.arrmd_material (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id          UUID NOT NULL,
  roteiro          JSONB NOT NULL,
  resumo           JSONB NOT NULL,
  source           TEXT,
  accepted         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  recomendacoes_ia TEXT,
  material_util    TEXT,
  observacoes      TEXT
);

CREATE TABLE IF NOT EXISTS public.feedback_aluno_aula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_arrmd UUID NOT NULL REFERENCES public.ARRMD(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  feedback TEXT
);





