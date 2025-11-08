export type LessonAgentPersona = {
  label: string
  description: string
  hyperfocus: string
  supports: string[]
}

export type LessonMaterial = {
  persona: LessonAgentPersona
  recomendacoes: string
  roteiro: string
  resumo: string
}

function chooseHyperfocus(subject: string): string {
  const s = subject.toLowerCase()
  if (s.includes('geograf')) return 'mapas e lugares do mundo'
  if (s.includes('hist')) return 'antiguidade e impérios'
  if (s.includes('ciên') || s.includes('cien')) return 'astronomia'
  if (s.includes('portugu') || s.includes('língua')) return 'tipos de texto'
  if (s.includes('mat')) return 'números e padrões'
  if (s.includes('biolog')) return 'dinossauros'
  return 'trens e sistemas de transporte'
}

export function getDefaultPersonaFromSubject(subject: string): LessonAgentPersona {
  const hyperfocus = chooseHyperfocus(subject)
  return {
    label: 'Estudante autista (TEA) com hiperfoco',
    description:
      'Persona de referência para planejar: comunicação clara e concreta, rotina previsível, pistas visuais, tempo para processamento e estratégias de regulação sensorial.',
    hyperfocus,
    supports: [
      'Antecipação da agenda e objetivos',
      'Instruções passo a passo com exemplos visuais',
      'Linguagem direta, sem ambiguidades',
      'Tempo extra para resposta e pausas curtas',
      'Opções de participação com baixa sobrecarga sensorial'
    ]
  }
}

export function generateLessonMaterial({
  assunto,
  descricao,
  turma,
  data,
  feedback
}: {
  assunto: string
  descricao: string
  turma: string
  data: string
  feedback?: string
}): LessonMaterial {
  const persona = getDefaultPersonaFromSubject(assunto)
  const header = `${assunto} — ${turma || 'turma'} (${data || 'sem data'})`
  const improve = feedback ? ` Ajustes pedidos: ${feedback}.` : ''

  const recomendacoes =
    `Contextualize o tema "${assunto}" partindo do interesse especial ` +
    `(${persona.hyperfocus}) para engajar. Use rotina previsível (agenda na lousa), ` +
    `instruções objetivas e visuais. Ofereça alternativas de participação com baixa ` +
    `sobrecarga sensorial e combine sinais para pausas. Reforce expectativas de forma ` +
    `positiva e dê tempo para processamento.${improve}`

  const roteiro =
    [
      `1) Boas‑vindas e previsão da aula (${header}). Mostrar agenda visual.`,
      `2) Ativação de conhecimento: conexão entre "${assunto}" e ${persona.hyperfocus}.`,
      `3) Mini‑exposição com exemplos concretos e imagens. Linguagem simples.`,
      `4) Atividade estruturada em passos curtos (fichas numeradas).`,
      `5) Opção de saída sensorial curta entre etapas, se necessário.`,
      `6) Compartilhamento: aluno escolhe entre falar, apontar, ou registrar por escrito/desenho.`,
      `7) Fechamento com checklist do que foi aprendido e tarefas claras.`
    ].join(' ')

  const resumo =
    `Ao final, os estudantes explicam os pontos‑chave de "${assunto}" e ` +
    `relacionam com ${persona.hyperfocus}. Use um mapa mental simples com ` +
    `3‑5 palavras‑chave. ${descricao ? `Baseie a mediação nesta descrição: "${descricao}".` : ''}`

  return {
    persona,
    recomendacoes,
    roteiro,
    resumo
  }
}


