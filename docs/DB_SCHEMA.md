DB Schema — Andori 

1) estudantes
- id (PK)
- nome (text, not null)
- data_nascimento (date, opcional)
- turma_id (FK → turmas.id, not null)
- hiperfoco (text, opcional) – ex.: "dinossauros"
- preferencias_cognitivas (jsonb, opcional) – ex.: {"modalidade":"visual","suporte":"nível2"}
- dificuldades (text[], opcional) – ex.: {"matemática","leitura"}
- observacoes (text, opcional)
- Índices: idx_estudantes_turma, GIN em preferencias_cognitivas se for filtrado

2) turmas
- id (PK)
- nome (text, not null) – ex.: "6ºA"
- etapa (text) – ex.: "Anos Finais"
- ano_letivo (int, not null)
- coordenador_id (FK → coordenadores.id, opcional)
- Índices: composto (ano_letivo, nome)

3) professores
- id (PK)
- nome (text, not null)
- disciplinas (text[]; ex.: {"Matemática","Ciências"})
- email (text, opcional)

4) coordenadores
- id (PK)
- nome (text, not null)
- email (text, opcional)

5) turmas_professores (pivot m:n)
- turma_id (FK → turmas.id, not null)
- professor_id (FK → professores.id, not null)
- PK composta (turma_id, professor_id)

6) disciplinas (opcional, se quiser normalizar)
- id (PK)
- nome (text unique) – ex.: "Matemática", "História"
- Observação: Caso não normalize, armazene o nome da disciplina diretamente nas tabelas de conteúdo.

7) geracoes_ia (auditoria e reprodutibilidade)
- id (PK)
- modelo (text) – ex.: "gpt-4o-mini"
- prompt (text) – versão do template usado
- parametros (jsonb) – temperatura, tokens, etc.
- entrada_contexto (jsonb) – snapshot do perfil do estudante/objetivo da aula
- custo_estimado (numeric, opcional)
- created_at (timestamptz default now())
- Uso: Relacione Resumos e Questões a uma geracao_id para rastrear como o conteúdo foi criado.

8) resumos
- id (PK)
- estudante_id (FK → estudantes.id, not null)
- turma_id (FK → turmas.id, not null)
- disciplina (text ou FK → disciplinas.id)
- titulo (text, not null)
- conteudo_md (text, not null) – markdown/HTML simples
- status (text check: draft|review|published, default draft)
- geracao_id (FK → geracoes_ia.id, opcional)
- created_by_professor_id (FK → professores.id, opcional)
- created_at (timestamptz default now())
- Índices: (estudante_id, disciplina, status)

9) questoes
- id (PK)
- estudante_id (FK → estudantes.id, not null)
- turma_id (FK → turmas.id, not null)
- disciplina (text ou FK)
- enunciado (text, not null)
- alternativas (jsonb, opcional) – para múltipla escolha
- gabarito (text ou jsonb, opcional)
- dificuldade (text check: baixa|média|alta, opcional)
- habilidade_objetivo (text, opcional) – objetivo da aula
- geracao_id (FK → geracoes_ia.id, opcional)
- created_by_professor_id (FK → professores.id, opcional)
- created_at (timestamptz default now())
- Índices: (estudante_id, disciplina), GIN em alternativas se necessário

10) aulas (opcional para organizar entregáveis por sessão)
- id (PK)
- turma_id (FK → turmas.id, not null)
- professor_id (FK → professores.id, not null)
- disciplina (text ou FK)
- tema (text)
- data (date)
- habilidade_objetivo (text)
- Relacionamentos de uso: criar tabelas pivô aulas_resumos e aulas_questoes se quiser versionar/compartilhar um mesmo material entre aulas.


