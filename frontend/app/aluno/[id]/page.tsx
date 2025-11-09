'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import Tabs from '@components/Tabs'

import {
  aulasAPI,
  descriptionAPI,
  recommendationAPI,
  studentsAPI,
  type Aula,
  type RecommendationContent,
  type StudentProfile
} from '@lib/api'

type Props = { params: { id: string } }

type DesempenhoRegistro = {
  desempenho: string[]
  materialUtil?: string
  observacoes?: string
}

// Opções de desempenho (mesmo do formulário)
const opcoesDesempenho = [
  { value: 'disperso', label: 'Disperso', color: '#EFB4C8' },
  { value: 'razoavel', label: 'Razoável', color: '#F4D35E' },
  { value: 'atento', label: 'Atento', color: '#6BAED6' },
  { value: 'focado', label: 'Focado', color: '#3B82C8' }
]

const materialUtilLabel: Record<string, { label: string; color: string }> = {
  muito_util: { label: 'material muito bom', color: '#6BAED6' },
  util: { label: 'material regular', color: '#F4D35E' },
  pouco_util: { label: 'material ruim', color: '#EFB4C8' }
}

const profileImages = ['/pfb.png', '/pfp.png', '/pfy.png', '/pfby.png']

const selectProfileImage = (identifier: string | number): string => {
  const str = String(identifier)
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash + str.charCodeAt(i)) % profileImages.length
  }
  return profileImages[Math.abs(hash) % profileImages.length]
}
const normalizeAula = (raw: any): Aula => {
  const uploadRaw = raw?.upload_arquivo
  let uploadData: any = null
  if (typeof uploadRaw === 'string') {
    try {
      uploadData = JSON.parse(uploadRaw)
    } catch {
      uploadData = null
    }
  } else if (uploadRaw && typeof uploadRaw === 'object') {
    uploadData = uploadRaw
  }

  return {
    id: raw?.id,
    titulo:
      raw?.titulo ??
      raw?.assunto ??
      uploadData?.titulo ??
      uploadData?.assunto ??
      'Aula sem título',
    assunto:
      raw?.assunto ??
      raw?.titulo ??
      uploadData?.assunto ??
      uploadData?.titulo ??
      'Aula sem título',
    turma:
      raw?.turma ??
      raw?.turma_nome ??
      uploadData?.turma ??
      uploadData?.turma_nome ??
      'Turma não informada',
    turma_id:
      raw?.turma_id ??
      raw?.turmaId ??
      uploadData?.turma_id ??
      null,
    turma_nome:
      raw?.turma_nome ??
      uploadData?.turma_nome ??
      null,
    data: raw?.data ?? uploadData?.data ?? '',
    descricao: raw?.descricao ?? uploadData?.descricao ?? '',
    arquivo: raw?.arquivo ?? uploadData?.arquivo ?? null,
    upload_arquivo: uploadData ?? raw?.upload_arquivo
  }
}

const desempenhoParaValor = (desempenho: string[]): number | null => {
  if (!desempenho || desempenho.length === 0) return null
  const valores: Record<string, number> = {
    disperso: 1,
    razoavel: 2,
    atento: 3,
    focado: 4
  }
  const soma = desempenho.reduce((acc, d) => acc + (valores[d] || 0), 0)
  return soma / desempenho.length
}

const formataDataCurta = (value: string) => {
  if (!value) return 'Data não informada'
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  return value
}

export default function AlunoPage({ params }: Props) {
  const router = useRouter()
  const alunoId = params.id

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [descricao, setDescricao] = useState<string>('')
  const [descricaoDraft, setDescricaoDraft] = useState<string>('')
  const [descricaoDialogOpen, setDescricaoDialogOpen] = useState(false)
  const [descricaoSaving, setDescricaoSaving] = useState(false)
  const [descricaoError, setDescricaoError] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [aulasTurma, setAulasTurma] = useState<Aula[]>([])
  const [loadingAulas, setLoadingAulas] = useState(false)

  const [desempenhoMap, setDesempenhoMap] = useState<Record<string, DesempenhoRegistro>>({})
  const [recommendation, setRecommendation] = useState<RecommendationContent | null>(null)
  const [recommendationError, setRecommendationError] = useState<string | null>(null)
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadStudent = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('▶️ Buscando dados do aluno', alunoId)
        const response = await studentsAPI.get(alunoId)
        if (cancelled) return
        const profile = response.student_profile
        console.log('✅ Aluno carregado', profile)
        setStudent(profile)
        setDescricao(profile.descricao_do_aluno ?? '')
      } catch (err: any) {
        if (!cancelled) {
          console.error('❌ Erro ao carregar aluno:', err)
          const message = err?.message?.includes('404')
            ? 'Aluno não encontrado.'
            : 'Não foi possível carregar as informações do aluno.'
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadStudent()

    return () => {
      cancelled = true
    }
  }, [alunoId])

  useEffect(() => {
    if (!student) return

    let cancelled = false
    const loadAulas = async () => {
      setLoadingAulas(true)
      try {
        console.log('▶️ Carregando aulas para turma', {
          turma_id: student.turma_id,
          turma_nome: student.turma_nome
        })
        const response = await aulasAPI.list()
        if (cancelled) return

        const items = Array.isArray(response.items) ? response.items : []
        const normalized = items.map(normalizeAula)

        const alunoTurmaId = student.turma_id ?? null
        const alunoTurmaNome = student.turma_nome?.trim().toLowerCase() ?? null

        const filtered = normalized.filter((aula) => {
          const aulaTurmaId = aula.turma_id ?? null
          const aulaTurmaNome = aula.turma?.trim().toLowerCase() ?? null

          if (alunoTurmaId && aulaTurmaId) {
            return aulaTurmaId === alunoTurmaId
          }
          if (alunoTurmaNome && aulaTurmaNome) {
            return aulaTurmaNome === alunoTurmaNome
          }
          return false
        })

        console.log('✅ Aulas filtradas para o aluno:', filtered)
        setAulasTurma(filtered)
      } catch (err) {
        if (!cancelled) {
          console.error('❌ Erro ao carregar aulas para o aluno:', err)
          setAulasTurma([])
        }
      } finally {
        if (!cancelled) {
          setLoadingAulas(false)
        }
      }
    }

    loadAulas()

    return () => {
      cancelled = true
    }
  }, [student?.turma_id, student?.turma_nome, student])

  useEffect(() => {
    if (!student) return
    let cancelled = false

    const loadRecommendation = async () => {
      setLoadingRecommendation(true)
      setRecommendationError(null)
      try {
        console.log('▶️ Buscando recomendações para aluno', alunoId)
        const data = await recommendationAPI.get({ alunoId })
        if (cancelled) return
        setRecommendation(data)
      } catch (err: any) {
        if (!cancelled) {
          console.error('❌ Erro ao carregar recomendações:', err)
          const message = err?.message?.includes('404')
            ? 'Recomendações ainda não foram geradas.'
            : 'Não foi possível carregar as recomendações.'
          setRecommendationError(message)
          setRecommendation(null)
        }
      } finally {
        if (!cancelled) {
          setLoadingRecommendation(false)
        }
      }
    }

    loadRecommendation()

    return () => {
      cancelled = true
    }
  }, [alunoId, student])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const map: Record<string, DesempenhoRegistro> = {}
    aulasTurma.forEach((aula) => {
      try {
        const raw = localStorage.getItem(`desempenho:${aula.id}`)
        if (!raw) return
        const parsed = JSON.parse(raw)
        map[aula.id] = {
          desempenho: Array.isArray(parsed.alunos)
            ? parsed.alunos
                .find((entry: any) => String(entry.alunoId) === alunoId)?.desempenho ?? []
            : [],
          materialUtil: parsed.materialUtil ?? undefined,
          observacoes: parsed.observacoes ?? undefined
        }
      } catch (err) {
        console.warn('⚠️ Não foi possível ler desempenho local da aula', aula.id, err)
      }
    })
    setDesempenhoMap(map)
  }, [aulasTurma, alunoId])

  const estatisticas = useMemo(() => {
    const contagem: Record<string, number> = {
      disperso: 0,
      razoavel: 0,
      atento: 0,
      focado: 0
    }

    Object.values(desempenhoMap).forEach((registro) => {
      registro.desempenho.forEach((valor) => {
        if (valor in contagem) {
          contagem[valor] += 1
        }
      })
    })

    return contagem
  }, [desempenhoMap])

  const dadosGrafico = useMemo(() => {
    return aulasTurma
      .map((aula) => {
        const registro = desempenhoMap[aula.id]
        const valor = registro ? desempenhoParaValor(registro.desempenho) : null
        if (valor === null) return null
        return {
          data: formataDataCurta(aula.data),
          valor,
          desempenho: registro.desempenho
        }
      })
      .filter((item): item is { data: string; valor: number; desempenho: string[] } => item !== null)
  }, [aulasTurma, desempenhoMap])

  const handleOpenDescricaoDialog = () => {
    setDescricaoDraft(descricao ?? '')
    setDescricaoError(null)
    setDescricaoDialogOpen(true)
  }

  const handleCloseDescricaoDialog = () => {
    if (descricaoSaving) return
    setDescricaoDialogOpen(false)
    setDescricaoError(null)
  }

  const handleSalvarDescricao = async () => {
    if (!student) return
    const texto = descricaoDraft.trim()
    if (texto.length === 0) {
      setDescricaoError('Descreva como esse aluno se comporta para salvar.')
      return
    }

    try {
      setDescricaoSaving(true)
      setDescricaoError(null)
      const response = await descriptionAPI.save(student.id, texto)
      setDescricao(response.descricao)
      setDescricaoDialogOpen(false)
    } catch (err: any) {
      console.error('❌ Erro ao salvar descrição:', err)
      const msg = err?.message?.includes('404')
        ? 'Aluno não encontrado durante a atualização.'
        : 'Não foi possível salvar a descrição. Tente novamente.'
      setDescricaoError(msg)
    } finally {
      setDescricaoSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="container-page py-20 flex items-center justify-center">
        <div className="border-2 border-[#EFB4C8] rounded-3xl p-10 bg-[#FFFEF1] text-center space-y-4 max-w-xl">
          <h1 className="text-2xl font-bold text-[#01162A]">Não foi possível carregar o aluno</h1>
          <p className="text-[#01162A]/70">{error ?? 'Aluno não encontrado.'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const alunoNome = student.nome || 'Aluno'
  const turmaLabel = student.turma_nome ? `Turma ${student.turma_nome}` : 'Turma não informada'

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <section className="panel rounded-tl-none p-8 -mt-px space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[#01162A] font-semibold hover:text-[#6BAED6] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div className="space-y-6">
          {/* Info do Aluno */}
          <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={selectProfileImage(student.id)}
                  alt={`Foto de ${alunoNome}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-[#01162A] mb-1">{alunoNome}</h1>
                  <p className="text-[#01162A]/70 text-sm">{turmaLabel}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.interesse && (
                    <InfoPill label="Interesses" value={student.interesse} />
                  )}
                  {student.preferencia && (
                    <InfoPill label="Preferências" value={student.preferencia} />
                  )}
                  {student.dificuldade && (
                    <InfoPill label="Dificuldades" value={student.dificuldade} />
                  )}
                  {student.nivel_de_suporte && (
                    <InfoPill label="Nível de suporte" value={student.nivel_de_suporte} />
                  )}
                  <div className="md:col-span-2">
                    <InfoPill
                      label="Observações"
                      value={student.observacoes || 'Sem observações registradas.'}
                    />
                    </div>
                  </div>

                <div className="border border-dashed border-[#C5C5C5] rounded-2xl p-4 bg-white/40">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-[#01162A]">
                      Descrição do professor
                    </h2>
                    <button
                      onClick={handleOpenDescricaoDialog}
                      className="px-4 py-2 rounded-xl border-2 border-[#EFB4C8] text-[#EFB4C8] font-semibold hover:bg-[#EFB4C8] hover:text-white transition-colors"
                    >
                      {descricao ? 'Editar descrição' : 'Registrar descrição'}
                    </button>
                  </div>
                  {descricao ? (
                    <p className="text-[#01162A] whitespace-pre-line">{descricao}</p>
                  ) : (
                    <p className="text-[#01162A]/60 text-sm">
                      Nenhuma descrição registrada ainda. Clique em &quot;Registrar descrição&quot;
                      para compartilhar suas observações sobre comportamento, pontos fortes e
                      necessidades.
                    </p>
                  )}
                </div>

                <div className="border border-[#C5C5C5] rounded-2xl p-4 bg-white/50">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-[#01162A]">
                      Recomendações personalizadas
                    </h2>
                    {loadingRecommendation && (
                      <span className="text-xs text-[#01162A]/60">Carregando...</span>
                    )}
                  </div>

                  {recommendation?.recomendacoes?.recomendacoes_ia ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[#01162A]/70">
                        {recommendation.recomendacoes?.assunto && (
                          <span className="font-semibold text-[#6BAED6]">
                            Aula: {recommendation.recomendacoes.assunto}
                          </span>
                        )}
                      </p>
                      <div className="rounded-xl border border-[#6BAED6]/50 bg-[#6BAED6]/10 p-4 text-sm text-[#01162A] whitespace-pre-line leading-relaxed">
                        {recommendation.recomendacoes.recomendacoes_ia}
                      </div>
                      <p className="text-xs text-[#01162A]/50">
                        Fonte: recomendações geradas pela inteligência artificial no fluxo de
                        planejamento da aula.
                      </p>
                    </div>
                  ) : recommendationError ? (
                    <p className="text-sm text-[#01162A]/60">
                      {recommendationError}
                    </p>
                  ) : (
                    <p className="text-sm text-[#01162A]/60">
                      Nenhuma recomendação disponível para este aluno ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desempenho na disciplina */}
          <div>
            <h2 className="text-2xl font-bold text-[#01162A] mb-4">Desempenho na disciplina</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
                <div className="grid grid-cols-2 gap-4">
                  {opcoesDesempenho.map((opcao) => (
                    <div key={opcao.value} className="flex items-center gap-3">
                      <span
                        className="inline-block w-8 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opcao.color }}
                      />
                      <span className="font-medium text-[#01162A]">
                        {estatisticas[opcao.value]} {opcao.label.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
                {dadosGrafico.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={dadosGrafico} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#C5C5C5" />
                    <XAxis 
                      dataKey="data" 
                      stroke="#01162A"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0.5, 4.5]}
                      ticks={[1, 2, 3, 4]}
                      tickFormatter={(value) => {
                        const labels = ['', 'Disperso', 'Razoável', 'Atento', 'Focado']
                        return labels[value] || ''
                      }}
                      stroke="#01162A"
                        tick={{ fontSize: 11 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#3B82C8"
                      strokeWidth={3}
                        dot={{ r: 5, fill: '#6BAED6', stroke: '#3B82C8', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-center text-sm text-[#01162A]/60">
                    Ainda não há desempenho registrado nas aulas desta turma para este aluno.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aulas */}
          <div>
            <h2 className="text-2xl font-bold text-[#01162A] mb-4">Aulas</h2>
            {loadingAulas ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
              </div>
            ) : aulasTurma.length === 0 ? (
              <div className="border-2 border-dashed border-[#C5C5C5] rounded-3xl p-8 text-center text-[#01162A]/70">
                Nenhuma aula encontrada para a turma deste aluno.
              </div>
            ) : (
            <div className="space-y-4">
                {aulasTurma.map((aula) => {
                  const registro = desempenhoMap[aula.id]
                  const desempenhoAtual = registro?.desempenho ?? []
                  const materialInfo = registro?.materialUtil
                    ? materialUtilLabel[registro.materialUtil] ?? null
                    : null
                
                return (
                  <button
                    key={aula.id}
                    onClick={() => router.push(`/aulas/${aula.id}`)}
                    className="w-full border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent hover:border-[#6BAED6] transition-colors text-left"
                  >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="font-bold text-xl text-[#01162A] mb-1">
                            {aula.assunto}
                        </div>
                          <div className="text-[#01162A]/70">{formataDataCurta(aula.data)}</div>
                      </div>
                      
                        <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#01162A]/70">
                              {desempenhoAtual.length > 0
                                ? desempenhoAtual
                                    .map((valor) => opcoesDesempenho.find((o) => o.value === valor)?.label)
                                    .filter(Boolean)
                                    .join(', ')
                                : 'Sem desempenho registrado'}
                          </span>
                            {desempenhoAtual.length > 0 && (
                          <span
                            className="w-8 h-8 rounded-full"
                                style={{
                                  backgroundColor:
                                    opcoesDesempenho.find((o) => o.value === desempenhoAtual[0])?.color ||
                                    '#C5C5C5'
                                }}
                              />
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#01162A]/70">
                              {materialInfo ? materialInfo.label : 'Material não avaliado'}
                          </span>
                            {materialInfo && (
                          <span
                            className="w-6 h-6 rotate-45 rounded-sm"
                            style={{ backgroundColor: materialInfo.color }}
                          />
                            )}
                          </div>
                        </div>
                      </div>

                      {registro?.observacoes && (
                        <div className="mt-4 rounded-2xl border border-[#EFB4C8]/60 bg-[#EFB4C8]/10 p-4 text-sm text-[#01162A]">
                          <span className="font-semibold block mb-2 text-[#EFB4C8]">
                            Observações do professor
                          </span>
                          {registro.observacoes}
                    </div>
                      )}
                  </button>
                )
              })}
            </div>
            )}
          </div>
        </div>
      </section>

      {descricaoDialogOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseDescricaoDialog} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#FFFEF1] border-2 border-[#EFB4C8] rounded-3xl shadow-xl">
              <div className="px-8 py-6 border-b-2 border-[#EFB4C8]/60">
                <h2 className="text-2xl font-bold text-[#01162A]">
                  Descreva este aluno
                </h2>
                <p className="text-sm text-[#01162A]/70 mt-2">
                  Compartilhe como o aluno se comporta em sala de aula, quais são seus pontos fortes
                  e fracos, interesses e desinteresses.
                </p>
              </div>

              <div className="px-8 py-6 space-y-4">
                <textarea
                  rows={6}
                  value={descricaoDraft}
                  onChange={(e) => setDescricaoDraft(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A] resize-none"
                  placeholder="Ex.: João se envolve com atividades práticas, gosta de história, mas tem dificuldades em se manter focado durante leituras longas..."
                />
                {descricaoError && (
                  <div className="rounded-xl border-2 border-[#FDA29B] bg-[#FEE4E2] px-4 py-3 text-sm text-[#7A271A]">
                    {descricaoError}
                  </div>
                )}
              </div>

              <div className="px-8 py-4 border-t-2 border-[#EFB4C8]/60 flex justify-end gap-3 bg-[#FFFEF1] rounded-b-3xl">
                <button
                  onClick={handleCloseDescricaoDialog}
                  className="px-5 py-2 rounded-xl border-2 border-[#C5C5C5] text-[#01162A] font-semibold hover:bg-[#C5C5C5]/20 transition-colors"
                  disabled={descricaoSaving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarDescricao}
                  className="px-6 py-2 rounded-xl bg-[#EFB4C8] text-[#FFFEF1] font-semibold hover:bg-[#E894B1] transition-colors disabled:opacity-70"
                  disabled={descricaoSaving}
                >
                  {descricaoSaving ? 'Salvando...' : 'Salvar descrição'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#C5C5C5] rounded-2xl px-4 py-3 bg-white/40">
      <span className="text-xs uppercase tracking-widest text-[#01162A]/40 font-semibold">
        {label}
      </span>
      <p className="mt-1 text-sm text-[#01162A]">{value}</p>
    </div>
  )
}

