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
  recomendacoes TEXT,
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


CREATE TABLE IF NOT EXISTS public.ARRMD (
    -- input do professor para gerar 
    disciplina TEXT,
    assunto TEXT,
    descricao TEXT,
    upload_arquivo BYTEA, -- bytea?

    -- feedback do professor 
    feedback_material TEXT, -- material ajudou?
    feedback_aula TEXT, -- muito, um pouco ...

    roteiro JSONB,
    resumo JSONB
)







