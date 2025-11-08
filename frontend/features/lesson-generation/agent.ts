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
  exemplos?: string[]
  perguntas?: string[]
}

export function getMinecraftPersona(): LessonAgentPersona {
  return {
    label: 'Estudante autista (TEA) com hiperfoco',
    description:
      'Comunicação clara e concreta, rotina previsível, pistas visuais, tempo para processamento e estratégias de regulação sensorial.',
    hyperfocus: 'Minecraft',
    supports: [
      'Antecipação da agenda e objetivos',
      'Instruções passo a passo com exemplos visuais (prints do Minecraft)',
      'Linguagem direta, sem ambiguidades',
      'Tempo extra para resposta e pausas curtas',
      'Opções de participação com baixa sobrecarga sensorial'
    ]
  }
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

function getPersonaFrom(subject: string, hyperfocus?: string): LessonAgentPersona {
  if (hyperfocus && hyperfocus.toLowerCase() === 'minecraft') {
    return getMinecraftPersona()
  }
  const base = getDefaultPersonaFromSubject(subject)
  if (hyperfocus) {
    return { ...base, hyperfocus }
  }
  return base
}

export function generateLessonMaterial({
  assunto,
  descricao,
  turma,
  data,
  feedback,
  hyperfocus
}: {
  assunto: string
  descricao: string
  turma: string
  data: string
  feedback?: string
  hyperfocus?: string
}): LessonMaterial {
  const persona = getPersonaFrom(assunto, hyperfocus)
  const header = `${assunto} — ${turma || 'turma'} (${data || 'sem data'})`
  const improve = feedback ? ` Ajustes pedidos: ${feedback}.` : ''

  const recomendacoes =
    `Checklist de suporte (TEA + hiperfoco em ${persona.hyperfocus}):\n` +
    `- Antecipe objetivos na lousa (agenda visual) e a sequência da aula.\n` +
    `- Dê instruções curtas e numeradas; mostre um exemplo concreto.\n` +
    `- Ofereça opções de participação: falar, apontar, escrever ou montar no ${persona.hyperfocus}.\n` +
    `- Combine um sinal para pausas curtas; permita tempo extra para resposta.\n` +
    `- Valide tentativas; foque no progresso e na clareza.${improve}`

  const roteiro =
    [
      `1) Abertura (${header})`,
      `Professor: "Hoje vamos estudar ${assunto} usando o ${persona.hyperfocus} como nosso mundo de exemplos."`,
      `Mostre a agenda visual (3 a 5 etapas).`,
      ``,
      `2) Conexão com o hiperfoco`,
      `Professor: "Se ${assunto} fosse uma construção no ${persona.hyperfocus}, que blocos/recursos seriam necessários?"`,
      `Exemplo (${persona.hyperfocus}): "Para explicar ${assunto}, pense que precisamos coletar recursos, combinar itens e seguir um plano de construção."`,
      ``,
      `3) Mini‑exposição com analogias`,
      `Fale frases curtas e mostre 1 imagem/diagrama. Evite parágrafos longos.`,
      `Professor: "Passo 1..., Passo 2..., Passo 3..."`,
      ``,
      `4) Atividade guiada (passos curtos)`,
      `Instrua em etapas numeradas e visíveis:`,
      `- Passo 1: (ex.: listar conceitos‑bloco).`,
      `- Passo 2: (ex.: ligar conceitos como se fossem crafting).`,
      `- Passo 3: (ex.: montar a 'construção' final que explica ${assunto}).`,
      `Ofereça opção de registro: quadro, caderno, cartões ou esquema que lembre crafting.`,
      ``,
      `5) Checagem de compreensão`,
      `Pergunte: "Qual bloco/parte foi mais difícil? O que falta para completar a construção?"`,
      `Professor: "Explique usando o exemplo do ${persona.hyperfocus}."`,
      ``,
      `6) Fechamento e tarefa`,
      `Checklist do que aprendemos. Tarefa curta: escrever/desenhar um exemplo de ${assunto} dentro do ${persona.hyperfocus}.`
    ].join('\n')

  const resumo =
    `Ao final, os estudantes explicam os pontos‑chave de "${assunto}" e ` +
    `relacionam com ${persona.hyperfocus}. Use um mapa mental simples com ` +
    `3‑5 palavras‑chave. ${descricao ? `Baseie a mediação nesta descrição: "${descricao}".` : ''}`

  const exemplos = [
    `No ${persona.hyperfocus}: comparar ${assunto} a uma construção com mineração, crafting e etapas.`,
    `Usar redstone como analogia para causa‑efeito ao explicar ${assunto}.`,
    `Criar um 'desafio' onde cada conceito de ${assunto} é um bloco que precisa se conectar.`
  ]
  const perguntas = [
    `Se ${assunto} fosse uma construção no ${persona.hyperfocus}, qual bloco faltaria?`,
    `Qual parte de ${assunto} liga com crafting? O que entra primeiro?`,
    `Explique ${assunto} usando um exemplo do ${persona.hyperfocus} que você já jogou.`
  ]

  return {
    persona,
    recomendacoes,
    roteiro,
    resumo,
    exemplos,
    perguntas
  }
}


