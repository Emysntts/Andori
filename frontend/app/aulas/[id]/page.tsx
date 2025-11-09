'use client'

import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Tabs from '@components/Tabs'

import {
  aulasAPI,
  studentsAPI,
  turmasAPI,
  materialAPI,
  performanceAPI,
  type Aula,
  type Aluno,
  type MaterialItem
} from '@lib/api'
import { selectProfileAvatar } from '@lib/avatar'

type DesempenhoAluno = {
  alunoId: string
  desempenho: string[]
}

type DesempenhoData = {
  materialUtil: string
  alunos: DesempenhoAluno[]
  observacoes: string
}

function DesempenhoDialog({
  open,
  onClose,
  onSave,
  turmaId,
  students = [],
  initialData = null,
  onDelete,
  externalError,
  loading = false
}: {
  open: boolean
  onClose: () => void
  onSave: (data: DesempenhoData) => Promise<void>
  turmaId?: string | null
  students: Array<{ id: string; nome: string }>
  initialData?: DesempenhoData | null
  onDelete?: () => Promise<void> | void
  externalError?: string | null
  loading?: boolean
}) {
  const [materialUtil, setMaterialUtil] = useState<string>('')
  const [alunosDesempenho, setAlunosDesempenho] = useState<Record<string, string[]>>({})
  const [observacoes, setObservacoes] = useState('')
  const [alunosLista, setAlunosLista] = useState(students)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      setMaterialUtil(initialData?.materialUtil ?? '')
      setObservacoes(initialData?.observacoes ?? '')
      const map: Record<string, string[]> = {}
      initialData?.alunos.forEach((entry) => {
        map[entry.alunoId] = entry.desempenho ?? []
      })
      setAlunosDesempenho(map)
      setLocalError(null)
    }
  }, [open, initialData])

  useEffect(() => {
    setAlunosLista(students)
  }, [students])

  useEffect(() => {
    if (!open || !turmaId) {
      return
    }

    let cancelled = false
    const loadStudents = async () => {
      setLoadingStudents(true)
      setStudentsError(null)
      try {
        console.log('▶️ Carregando estudantes para dialog', turmaId)
        const response = await studentsAPI.list({ turmaId })
        if (cancelled) return
        const items =
          response.items?.map((item) => ({ id: String(item.id), nome: item.nome })) ?? []
        setAlunosLista(items)
      } catch (err: any) {
        if (!cancelled) {
          console.error('❌ Erro ao carregar estudantes (dialog):', err)
          const message = err?.message?.includes('404')
            ? 'Nenhum estudante encontrado para esta turma.'
            : 'Não foi possível carregar os estudantes desta turma.'
          setStudentsError(message)
          setAlunosLista([])
        }
      } finally {
        if (!cancelled) {
          setLoadingStudents(false)
        }
      }
    }

    loadStudents()

    return () => {
      cancelled = true
    }
  }, [open, turmaId])

  const opcoesUtilidade = [
    { value: 'muito_util', label: 'Muito útil', color: '#6BAED6' },
    { value: 'util', label: 'Útil', color: '#F4D35E' },
    { value: 'pouco_util', label: 'Pouco útil', color: '#EFB4C8' }
  ]

  const opcoesDesempenho = [
    { value: 'disperso', label: 'Disperso', color: '#EFB4C8' },
    { value: 'razoavel', label: 'Razoável', color: '#F4D35E' },
    { value: 'atento', label: 'Atento', color: '#6BAED6' },
    { value: 'focado', label: 'Focado', color: '#3B82C8' }
  ]

  const toggleAlunoDesempenho = (alunoId: string, value: string) => {
    setAlunosDesempenho(prev => {
      const current = prev[alunoId] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [alunoId]: updated }
    })
  }

  const handleSave = async () => {
    const data: DesempenhoData = {
      materialUtil,
      alunos: Object.entries(alunosDesempenho).map(([id, desempenho]) => ({
        alunoId: id,
        desempenho: desempenho || []
      })),
      observacoes
    }
    setSubmitting(true)
    setLocalError(null)
    try {
      await onSave(data)
      onClose()
    } catch (err: any) {
      console.error('❌ Erro ao salvar desempenho (dialog):', err)
      setLocalError(err?.message || 'Não foi possível salvar o desempenho.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    setLocalError(null)
    try {
      await onDelete()
      onClose()
    } catch (err: any) {
      console.error('❌ Erro ao excluir desempenho (dialog):', err)
      setLocalError(err?.message || 'Não foi possível excluir o desempenho.')
    } finally {
      setDeleting(false)
    }
  }

  const errorMessage = localError || externalError || null

  const alunosSection = loadingStudents ? (
    <div className="flex items-center justify-center py-6">
      <div className="w-10 h-10 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
    </div>
  ) : alunosLista.length === 0 ? (
    <p className="text-sm text-[#01162A]/70">
      {studentsError ?? 'Nenhum estudante disponível para registrar desempenho.'}
    </p>
  ) : (
    alunosLista.map((aluno, index) => {
      const colors = ['#EFB4C8', '#6BAED6', '#3B82C8']
      const borderColor = colors[index % colors.length]
      return (
        <div key={aluno.id} className="border-2 rounded-2xl p-4" style={{ borderColor }}>
          <div className="font-semibold text-[#01162A] mb-3">{aluno.nome}</div>
          <div className="flex gap-2 flex-wrap">
            {opcoesDesempenho.map((opcao) => {
              const isSelected = (alunosDesempenho[aluno.id] || []).includes(opcao.value)
              return (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => toggleAlunoDesempenho(aluno.id, opcao.value)}
                  className="px-4 py-2 rounded-full border-2 font-medium text-sm transition-all"
                  style={{
                    borderColor: opcao.color,
                    backgroundColor: isSelected ? opcao.color : 'transparent',
                    color: isSelected ? '#FFFEF1' : opcao.color
                  }}
                >
                  {opcao.label}
                </button>
              )
            })}
          </div>
        </div>
      )
    })
  )

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-[#FFFEF1] rounded-3xl border-2 border-[#6BAED6] max-h-[90vh] flex flex-col">
          <div className="px-8 py-5 border-b-2 border-[#C5C5C5] flex-shrink-0">
            <h2 className="text-2xl font-bold text-[#01162A]">Desempenho</h2>
          </div>
          
          <form
            className="overflow-y-auto px-8 py-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (!submitting && !loading) {
                void handleSave()
              }
            }}
          >
            {/* Material foi útil */}
            <div className="space-y-2">
              <label className="text-base font-bold text-[#01162A]">
                O material foi útil para a aula?
              </label>
              <div className="flex gap-3 flex-wrap">
                {opcoesUtilidade.map((opcao) => (
                  <button
                    key={opcao.value}
                    type="button"
                    onClick={() => setMaterialUtil(opcao.value)}
                    className="px-6 py-3 rounded-full border-2 font-semibold transition-all"
                    style={{
                      borderColor: opcao.color,
                      backgroundColor: materialUtil === opcao.value ? opcao.color : 'transparent',
                      color: materialUtil === opcao.value ? '#FFFEF1' : opcao.color
                    }}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desempenho dos alunos */}
            <div className="space-y-3">
              <label className="text-base font-bold text-[#01162A]">
                Desempenho dos alunos
              </label>
              <div className="space-y-3">{alunosSection}</div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <label className="text-base font-bold text-[#01162A]">
                Observações
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 focus:outline-none focus:border-[#6BAED6] bg-transparent text-[#01162A] resize-none"
                placeholder="Adicione suas observações sobre a aula..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border-2 border-[#EFB4C8] bg-[#EFB4C8]/10 px-4 py-3 text-sm text-[#01162A]">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 pb-2 sticky bottom-0 bg-[#FFFEF1]">
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => !deleting && void handleDelete()}
                  className="px-6 py-3 rounded-xl border-2 border-[#EFB4C8] text-[#EFB4C8] font-semibold hover:bg-[#EFB4C8]/10 transition-colors disabled:opacity-50"
                  disabled={deleting || submitting || loading}
                >
                  {deleting ? 'Excluindo...' : 'Excluir registros'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border-2 border-[#C5C5C5] text-[#01162A] font-semibold hover:bg-[#C5C5C5]/20 transition-colors disabled:opacity-50"
                disabled={submitting || deleting || loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || deleting || loading}
              >
                {submitting || loading ? 'Salvando...' : 'Salvar Desempenho'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AulaDetalhePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const rawAulaId = params?.id
  const aulaId = Array.isArray(rawAulaId) ? rawAulaId[0] : rawAulaId ?? null

  console.log('🔎 AulaDetalhePage render', { params, aulaId })
  const [aula, setAula] = useState<Aula | null>(null)
  const [students, setStudents] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [materialRecords, setMaterialRecords] = useState<MaterialItem[]>([])
  const [materialLoading, setMaterialLoading] = useState(false)
  const [materialError, setMaterialError] = useState<string | null>(null)
  const [openDesempenho, setOpenDesempenho] = useState(false)
  const [desempenhoSalvo, setDesempenhoSalvo] = useState<DesempenhoData | null>(null)
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [performanceError, setPerformanceError] = useState<string | null>(null)
  const [savingPerformance, setSavingPerformance] = useState(false)

  const primaryMaterial = useMemo<MaterialItem | null>(
    () => (materialRecords.length > 0 ? materialRecords[0] : null),
    [materialRecords]
  )
  const materialData = primaryMaterial
  const hasMaterial = Boolean(primaryMaterial)

  useEffect(() => {
    if (!aulaId) {
      console.warn('⚠️ Nenhum ID de aula encontrado na URL')
      return
    }

    let cancelled = false

    const run = async () => {
      console.log('▶️ useEffect loadData start', aulaId)
      setLoading(true)
      setError(null)

      try {
        const response = await aulasAPI.get(aulaId)
        if (cancelled) return

        // A API retorna o objeto diretamente, não dentro de { aula: {...} }
        const aulaResponse = 'aula' in response ? response.aula : response
        
        const uploadRaw = aulaResponse.upload_arquivo
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

        const aulaNormalized: Aula = {
          id: aulaResponse.id ?? aulaId,
          titulo: aulaResponse.assunto ?? aulaResponse.titulo ?? 'Aula sem título',
          assunto: aulaResponse.assunto ?? aulaResponse.titulo ?? 'Aula sem título',
          descricao: aulaResponse.descricao ?? '',
          data: uploadData?.data ?? '',
          turma: uploadData?.turma ?? uploadData?.turma_nome ?? 'Turma não informada',
          turma_id: uploadData?.turma_id ?? null,
          arquivo: uploadData?.arquivo ?? null,
          upload_arquivo: uploadData ?? aulaResponse.upload_arquivo
        }

        setAula(aulaNormalized)

        const loadStudentsForAula = async () => {
          let turmaIdToUse = aulaNormalized.turma_id ?? null
          const turmaNome = aulaNormalized.turma
          console.log('🔍 Preparando para carregar estudantes', {
            turmaIdToUse,
            turmaNome
          })

          if (!turmaIdToUse && turmaNome && turmaNome !== 'Turma não informada') {
            try {
              console.log('🔄 Tentando resolver turma_id pelo nome da turma:', turmaNome)
              const turmasRes = await turmasAPI.list()

              if (cancelled) {
                console.log('⏹️ Busca de turmas cancelada')
                return
              }

              const normalizedNome = turmaNome.trim().toLowerCase()
              const turmaMatch = turmasRes.items?.find((turmaItem) => {
                const nome = turmaItem?.nome
                if (!nome) return false
                return nome.trim().toLowerCase() === normalizedNome
              })

              if (turmaMatch) {
                console.log('✅ Turma encontrada pelo nome:', turmaMatch)
                turmaIdToUse = turmaMatch.id
                setAula(prev => {
                  if (cancelled) return prev
                  if (!prev) {
                    return { ...aulaNormalized, turma_id: turmaMatch.id, turma: turmaMatch.nome }
                  }
                  return { ...prev, turma_id: turmaMatch.id, turma: turmaMatch.nome }
                })
              } else {
                console.log('⚠️ Nenhuma turma encontrada com o nome informado:', turmaNome)
              }
            } catch (turmaError) {
              console.error('❌ Erro ao tentar resolver turma_id pelo nome:', turmaError)
            }
          }

          if (!turmaIdToUse) {
            console.log('⚠️ Ainda sem turma_id, não é possível carregar estudantes.')
            setStudents([])
            return
          }

          try {
            setStudentsLoading(true)
            console.log('📡 Buscando estudantes com turma_id resolvido:', turmaIdToUse)
            const studentsRes = await studentsAPI.list({ turmaId: turmaIdToUse })

            if (cancelled) {
              console.log('⏹️ Requisição de estudantes cancelada')
              return
            }

            console.log('✅ Resposta da API de estudantes:', studentsRes)
            console.log('✅ Quantidade de estudantes:', studentsRes.items?.length || 0)
            console.log('✅ Estudantes:', studentsRes.items)

            setStudents(studentsRes.items || [])
          } catch (studentError: any) {
            if (!cancelled) {
              console.error('❌ Erro ao carregar estudantes:', studentError)
              console.error('❌ Mensagem:', studentError?.message)
              console.error('❌ Stack:', studentError?.stack)
              setStudents([])
            }
          } finally {
            if (!cancelled) {
              console.log('🏁 Finalizando carregamento de estudantes')
              setStudentsLoading(false)
            }
          }
        }

        await loadStudentsForAula()
      } catch (err: any) {
        if (!cancelled) {
          console.error('❌ Erro ao carregar aula:', err)
          const message = err?.message?.includes('404')
            ? 'Aula não encontrada.'
            : 'Não foi possível carregar os detalhes da aula.'
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      cancelled = true
      console.log('⏹️ Cancelando carregamento da aula', aulaId)
    }
  }, [aulaId])

  useEffect(() => {
    if (!aulaId) {
      return
    }

    let cancelled = false

    const loadPerformance = async () => {
      setPerformanceLoading(true)
      setPerformanceError(null)
      try {
        const performance = await performanceAPI.get(aulaId)
        if (cancelled) return
        if (performance) {
          const normalized: DesempenhoData = {
            materialUtil: performance.material_util ?? '',
            observacoes: performance.observacoes ?? '',
            alunos: (performance.alunos ?? []).map((entry) => ({
              alunoId: String(entry.aluno_id),
              desempenho: Array.isArray(entry.desempenho) ? entry.desempenho : []
            }))
          }
          setDesempenhoSalvo(normalized)
        } else {
          setDesempenhoSalvo(null)
        }
      } catch (err: any) {
        if (cancelled) return
        console.error('❌ Erro ao carregar desempenho salvo:', err)
        const is404 = err?.message?.includes('404')
        if (is404) {
          setDesempenhoSalvo(null)
          setPerformanceError(null)
        } else {
          setPerformanceError('Não foi possível carregar o desempenho salvo desta aula.')
          setDesempenhoSalvo(null)
        }
      } finally {
        if (!cancelled) {
          setPerformanceLoading(false)
        }
      }
    }

    const loadMaterial = async () => {
      setMaterialLoading(true)
      setMaterialError(null)
      try {
        const materials = await materialAPI.listByAula(aulaId)
        if (cancelled) return
        setMaterialRecords(materials)
        if (materials.length > 0) {
          await loadPerformance()
        } else {
          setDesempenhoSalvo(null)
          setPerformanceError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('❌ Erro ao carregar materiais da aula:', err)
          setMaterialError('Não foi possível carregar os materiais aprovados desta aula.')
          setMaterialRecords([])
          setDesempenhoSalvo(null)
        }
      } finally {
        if (!cancelled) {
          setMaterialLoading(false)
        }
      }
    }

    loadMaterial()

    return () => {
      cancelled = true
    }
  }, [aulaId])

  const assunto = aula?.assunto || 'Tema da aula'
  const descricao = aula?.descricao || 'Descrição não disponível'

  const buildSearchParams = (extra: Record<string, string> = {}) => {
    const sp = new URLSearchParams()
    if (aula?.assunto) sp.set('assunto', aula.assunto)
    if (aula?.descricao) sp.set('descricao', aula.descricao)
    if (aula?.data) sp.set('data', aula.data)
    if (aula?.turma) sp.set('turma', aula.turma)
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        sp.set(key, value)
      }
    })
    return sp
  }

  if (loading) {
    return (
      <div>
        <Tabs
          tabs={[
            { href: '/', label: 'turmas' },
            { href: '/aulas', label: 'aulas' }
          ]}
        />

        <section className="panel-blue rounded-tl-none p-8 -mt-px space-y-8">
          <div className="rounded-3xl p-8 bg-[#FFFEF1] min-h-[400px] flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-page py-20 flex items-center justify-center">
        <div className="border-2 border-[#EFB4C8] rounded-3xl p-10 bg-[#FFFEF1] text-center space-y-4 max-w-xl">
          <h1 className="text-2xl font-bold text-[#01162A]">Não foi possível carregar esta aula</h1>
          <p className="text-[#01162A]/70">{error}</p>
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

  const handleSaveDesempenho = async (data: DesempenhoData): Promise<void> => {
    if (!aulaId) {
      throw new Error('Aula não encontrada.')
    }
    setSavingPerformance(true)
    setPerformanceError(null)
    try {
      const payload = {
        arrmd_id: aulaId,
        material_util: data.materialUtil || null,
        observacoes: data.observacoes || null,
        alunos: data.alunos.map((aluno) => ({
          aluno_id: aluno.alunoId,
          desempenho: aluno.desempenho
        }))
      }
      const saved = await performanceAPI.save(payload)
      const normalized: DesempenhoData = {
        materialUtil: saved.material_util ?? '',
        observacoes: saved.observacoes ?? '',
        alunos: (saved.alunos ?? []).map((entry) => ({
          alunoId: String(entry.aluno_id),
          desempenho: Array.isArray(entry.desempenho) ? entry.desempenho : []
        }))
      }
      setDesempenhoSalvo(normalized)
    } catch (err: any) {
      console.error('❌ Erro ao salvar desempenho:', err)
      const message = err?.message || 'Não foi possível salvar o desempenho.'
      setPerformanceError(message)
      throw err
    } finally {
      setSavingPerformance(false)
    }
  }

  const handleDeleteDesempenho = async (): Promise<void> => {
    if (!aulaId) {
      throw new Error('Aula não encontrada.')
    }
    setSavingPerformance(true)
    setPerformanceError(null)
    try {
      await performanceAPI.delete(aulaId)
      setDesempenhoSalvo(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir desempenho:', err)
      const message = err?.message || 'Não foi possível excluir o desempenho.'
      setPerformanceError(message)
      throw err
    } finally {
      setSavingPerformance(false)
    }
  }


  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <section className="panel-blue rounded-tl-none p-8 -mt-px space-y-8">
      <div className="rounded-3xl p-8 bg-[#FFFEF1]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#01162A] font-semibold mb-6 hover:text-[#F4D35E] transition-colors"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Voltar
        </button>

      <div className="space-y-6">
          <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
            <h1 className="text-2xl font-bold text-[#01162A] mb-3">{assunto}</h1>
            <p className="text-[#01162A]">{descricao}</p>
            {aula?.arquivo && (
              <div className="mt-4 border border-dashed border-[#C5C5C5] rounded-2xl p-4 bg-white/40">
                <h3 className="text-sm font-semibold text-[#01162A] mb-2">Arquivo anexado</h3>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-sm text-[#01162A]/80">
                    {aula.arquivo?.name || aula.arquivo?.fileName || aula.arquivo?.titulo || 'Documento'}
                  </div>
                  {aula.arquivo?.url ? (
                    <a
                      href={aula.arquivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#6BAED6] text-white text-sm font-semibold hover:bg-[#3B82C8] transition-colors"
                    >
                      Abrir arquivo
                    </a>
                  ) : (
                    <span className="text-xs text-[#01162A]/60">
                      Nenhum link disponível
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
              <h2 className="text-xl font-bold text-[#01162A] mb-4">Estudantes</h2>
            <div className="space-y-3">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-10 h-10 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
                  </div>
                ) : students.length === 0 ? (
                  <p className="text-[#01162A]/70 text-sm text-center">
                    Nenhum estudante encontrado para esta turma.
                  </p>
                ) : (
                  students.map((student, index) => {
                    const colors = ['#EFB4C8', '#6BAED6', '#3B82C8']
                    const borderColor = colors[index % colors.length]
                      const profileSrc = selectProfileAvatar(student.id ?? index)
                    return (
                      <button
                        key={student.id}
                        onClick={() => router.push(`/aluno/${student.id}`)}
                        className="w-full flex items-center gap-3 border-2 rounded-2xl px-4 py-3 transition-all hover:scale-[1.02] cursor-pointer"
                        style={{ borderColor }}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden">
                          <Image
                            src={profileSrc}
                            alt={`Foto de ${student.nome}`}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-[#01162A]">{student.nome}</div>
                          <div className="text-sm text-[#01162A]/70">
                            {aula?.turma ? `Turma ${aula.turma}` : 'Sem turma vinculada'}
                          </div>
                        </div>
                        <svg 
                          className="w-5 h-5 text-[#01162A]/40 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                          />
                        </svg>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
              <h2 className="text-xl font-bold text-[#01162A] mb-4">Material</h2>
              {materialError && (
                <div className="mb-4 rounded-xl border-2 border-[#EFB4C8] bg-[#EFB4C8]/10 px-4 py-3 text-sm text-[#01162A]">
                  {materialError}
                </div>
              )}
              {materialLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
                </div>
              ) : hasMaterial && materialData ? (
                <div className="space-y-4">
                  <div className="bg-[#F4D35E]/10 border border-[#F4D35E] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-[#F4D35E]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold text-[#01162A]">Material criado e aprovado</span>
                    </div>
                    <div className="text-sm text-[#01162A]/80 space-y-1">
                      <div>✓ Roteiro e resumo disponíveis</div>
                      {Boolean((materialData as any)?.exemplos) && <div>✓ Exemplos prontos</div>}
                      {Boolean((materialData as any)?.perguntas) && <div>✓ Perguntas para checagem</div>}
                    </div>
                    <div className="text-xs text-[#01162A]/60 mt-3">
                      Criado em: {new Date(materialData.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="flex-1 px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
                      onClick={() => {
                        if (!aulaId) return
                        const search = buildSearchParams().toString()
                        router.push(`/aulas/${aulaId}/material?${search}`)
                      }}
                    >
                      Ver Material Completo
                    </button>
                  </div>
                </div>
              ) : hasMaterial ? (
                <div className="text-center py-4">
                  <p className="text-[#6BAED6] font-medium mb-6">
                    Material criado e aprovado ✓
                  </p>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
                      onClick={() => {
                        if (!aulaId) return
                        const search = buildSearchParams().toString()
                        router.push(`/aulas/${aulaId}/material?${search}`)
                      }}
                    >
                      Ver Material
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[#F4D35E] font-medium mb-6">
              Você ainda não criou o material
                  </p>
            <button
                      className="px-6 py-3 rounded-xl bg-[#F4D35E] text-[#01162A] font-semibold hover:bg-[#F4D35E]/80 transition-colors"
              onClick={() => {
                        if (!aulaId) return
                        sessionStorage.removeItem(`material:${aulaId}`)
                        sessionStorage.removeItem(`material:${aulaId}`)
                        sessionStorage.removeItem(`material:${aulaId}`)
                        const newParams = buildSearchParams({ _t: Date.now().toString() })
                        router.push(`/aulas/${aulaId}/gerando?${newParams.toString()}`)
                    }}
                  >
                    Criar Material
                  </button>
                </div>
              )}
            </div>

            {/* Seção de Desempenho - sempre aparece, mas bloqueada até material ser criado */}
            <div className={`border-2 rounded-3xl p-6 ${hasMaterial ? 'border-[#C5C5C5] bg-transparent' : 'border-[#C5C5C5]/50 bg-[#C5C5C5]/10'} relative`}>
              {!hasMaterial && (
                <div className="absolute inset-0 bg-[#FFFEF1]/80 rounded-3xl flex items-center justify-center backdrop-blur-[2px] z-10">
                  <div className="text-center px-6">
                    <svg className="w-12 h-12 mx-auto mb-3 text-[#C5C5C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-[#01162A] font-semibold mb-1">Seção bloqueada</p>
                    <p className="text-sm text-[#01162A]/70">
                      Crie o material da aula primeiro para<br />poder registrar o desempenho
                    </p>
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-bold text-[#01162A] mb-4">Desempenho</h2>
              {performanceError && (
                <div className="mb-3 rounded-xl border-2 border-[#EFB4C8] bg-[#EFB4C8]/10 px-4 py-3 text-sm text-[#01162A]">
                  {performanceError}
                </div>
              )}
              {performanceLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-10 h-10 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
                </div>
              ) : desempenhoSalvo ? (
                <div className="space-y-4">
                  <div className="bg-[#6BAED6]/10 border border-[#6BAED6] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-[#6BAED6]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold text-[#01162A]">Desempenho registrado</span>
                    </div>
                    <p className="text-sm text-[#01162A]/80">
                      ✓ Avaliação do material registrada
                    </p>
                    <p className="text-sm text-[#01162A]/80">
                      ✓ Desempenho de {desempenhoSalvo.alunos.length} aluno(s)
                    </p>
                    {desempenhoSalvo.observacoes && (
                      <p className="text-sm text-[#01162A]/80">
                        ✓ Observações registradas
                      </p>
                    )}
                  </div>
                  <button
                    className="w-full px-6 py-3 rounded-xl border-2 border-[#6BAED6] text-[#01162A] font-semibold hover:bg-[#6BAED6]/10 transition-colors"
                    onClick={() => !savingPerformance && setOpenDesempenho(true)}
                    disabled={!hasMaterial || savingPerformance}
                  >
                    {savingPerformance ? 'Aguarde...' : 'Editar Desempenho'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[#01162A]/70 mb-4 text-sm">
                    Registre o desempenho dos alunos nesta aula
                  </p>
                  <button
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-colors ${
                      hasMaterial 
                        ? 'bg-[#6BAED6] text-white hover:bg-[#3B82C8]' 
                        : 'bg-[#C5C5C5]/50 text-[#01162A]/50 cursor-not-allowed'
                    }`}
                    onClick={() => hasMaterial && !savingPerformance && setOpenDesempenho(true)}
                    disabled={!hasMaterial || savingPerformance}
                  >
                    {savingPerformance ? 'Salvando...' : 'Registrar Desempenho'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DesempenhoDialog
        open={openDesempenho}
        onClose={() => setOpenDesempenho(false)}
        onSave={handleSaveDesempenho}
        turmaId={aula?.turma_id ?? null}
        students={students.map((student) => ({ id: student.id, nome: student.nome }))}
        initialData={desempenhoSalvo}
        onDelete={desempenhoSalvo ? handleDeleteDesempenho : undefined}
        externalError={performanceError}
        loading={savingPerformance}
      />
      </section>
    </div>
  )
}


