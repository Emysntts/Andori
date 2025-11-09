'use client'

import { useState, useEffect, useRef } from 'react'
import Tabs from '@components/Tabs'
import { useRouter } from 'next/navigation'
import Calendar from '@components/Calendar'
import {
  aulasAPI,
  turmasAPI,
  type Aula,
  type AulaCreatePayload,
  type Turma
} from '@lib/api'

type AulaFormState = {
  assunto: string
  turma: string
  turma_id?: string | null
  data: string
  descricao: string
  arquivo: File | null
}

function CreateAulaModal({
  open,
  onClose,
  onCreate,
  turmas,
  loadingTurmas,
  turmasError,
  onRetryTurmas
}: {
  open: boolean
  onClose: () => void
  onCreate: (payload: AulaFormState) => void
  turmas: Turma[]
  loadingTurmas: boolean
  turmasError: string | null
  onRetryTurmas: () => void
}) {
  const [form, setForm] = useState<AulaFormState>({
    assunto: '',
    turma: '',
    turma_id: null,
    data: '',
    descricao: '',
    arquivo: null
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isTurmaListOpen, setIsTurmaListOpen] = useState(false)
 
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl bg-[#FFFEF1] rounded-3xl border-2 border-[#6BAED6]">
          <div className="px-8 py-6 border-b-2 border-[#C5C5C5]">
            <h2 className="text-2xl font-bold text-[#01162A]">Criar Aula</h2>
          </div>
          <form
            className="p-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (!form.turma_id || !form.turma) {
                setFormError('Selecione uma turma antes de criar a aula.')
                return
              }
              setFormError(null)
              onCreate(form)
              onClose()
              setForm({
                assunto: '',
                turma: '',
                turma_id: null,
                data: '',
                descricao: '',
                arquivo: null
              })
              setIsTurmaListOpen(false)
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#01162A]">
                Assunto da Aula
              </label>
              <input
                type="text"
                className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 focus:outline-none focus:border-[#6BAED6] bg-transparent text-[#01162A]"
                value={form.assunto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assunto: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#01162A]">
                  Turma
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTurmaListOpen((prev) => !prev)}
                    className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 text-left focus:outline-none focus:border-[#6BAED6] bg-transparent text-[#01162A] flex items-center justify-between"
                  >
                    <span>{form.turma || 'Selecione uma turma'}</span>
                    <span className="ml-2 text-[#6BAED6]">
                      {isTurmaListOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  {isTurmaListOpen && (
                    <div className="absolute z-10 mt-2 w-full max-h-52 overflow-y-auto rounded-xl border-2 border-[#C5C5C5] bg-[#FFFEF1] shadow-lg">
                      {loadingTurmas && (
                        <div className="px-4 py-3 text-sm text-[#6BAED6]">
                          Carregando turmas...
                        </div>
                      )}
                      {turmasError && (
                        <div className="px-4 py-3 text-sm text-[#7A271A] space-y-2">
                          <p>{turmasError}</p>
                          <button
                            type="button"
                            className="text-[#6BAED6] underline"
                            onClick={onRetryTurmas}
                          >
                            Tentar novamente
                          </button>
                        </div>
                      )}
                      {!loadingTurmas && !turmasError && turmas.length === 0 && (
                        <div className="px-4 py-3 text-sm text-[#01162A]">
                          Nenhuma turma cadastrada.
                        </div>
                      )}
                      {!loadingTurmas &&
                        !turmasError &&
                        turmas.map((turma) => (
                          <button
                            key={turma.id}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                turma: turma.nome,
                                turma_id: turma.id
                              }))
                              setIsTurmaListOpen(false)
                            }}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-[#6BAED6]/20 transition-colors ${
                              form.turma_id === turma.id ? 'bg-[#6BAED6]/10 font-semibold' : ''
                            }`}
                          >
                            {turma.nome}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#01162A]">
                  Data
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 focus:outline-none focus:border-[#6BAED6] bg-transparent text-[#01162A]"
                  value={form.data}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, data: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#01162A]">
                Descrição
              </label>
              <textarea
                rows={4}
                className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 focus:outline-none focus:border-[#6BAED6] bg-transparent text-[#01162A] resize-none"
                value={form.descricao}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#01162A]">
                Upload Arquivo
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    arquivo: e.target.files?.[0] ?? null
                  }))
                }
                className="block w-full text-sm text-[#01162A] file:mr-4 file:rounded-xl file:border-2 file:border-[#6BAED6] file:bg-transparent file:px-4 file:py-2 file:text-[#6BAED6] file:font-semibold hover:file:bg-[#6BAED6] hover:file:text-white file:transition-colors"
              />
            </div>

            {formError && (
              <div className="rounded-xl border-2 border-[#FDA29B] bg-[#FEE4E2] px-4 py-3 text-sm text-[#7A271A]">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border-2 border-[#C5C5C5] text-[#01162A] font-semibold hover:bg-[#C5C5C5]/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default function AulasPage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [aulas, setAulas] = useState<Aula[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loadingTurmas, setLoadingTurmas] = useState(false)
  const [turmasError, setTurmasError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)

  function normalizeAula(raw: any, fallback?: AulaFormState): Aula {
    const id = raw?.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()))
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
    const assunto = raw?.assunto ?? raw?.titulo ?? uploadData?.assunto ?? fallback?.assunto ?? 'Aula sem título'
    const turma = raw?.turma ?? raw?.turma_nome ?? uploadData?.turma ?? uploadData?.turma_nome ?? fallback?.turma ?? 'Turma não informada'
    const turmaId = raw?.turma_id ?? raw?.turmaId ?? uploadData?.turma_id ?? fallback?.turma_id ?? null
    const data = raw?.data ?? uploadData?.data ?? fallback?.data ?? ''
    const descricao = raw?.descricao ?? uploadData?.descricao ?? fallback?.descricao ?? ''
    const arquivo = raw?.arquivo ?? uploadData?.arquivo ?? null

    let titulo = raw?.titulo
    if (!titulo) {
      titulo = assunto || 'Aula sem título'
    }

    return {
      id,
      titulo,
      assunto,
      turma,
      turma_id: turmaId,
      data,
      descricao,
      arquivo
    }
  }

  function formatDateLabel(value: string): string {
    if (!value) return 'Data não informada'

    const isoMatch = /^\d{4}-\d{2}-\d{2}/.test(value)
    const slashMatch = /^\d{2}\/\d{2}(\/\d{2,4})?$/.test(value)

    let parsed: Date | null = null

    if (isoMatch) {
      parsed = new Date(value)
    } else if (slashMatch) {
      const [dayStr, monthStr, yearStr] = value.split('/')
      const day = Number(dayStr)
      const month = Number(monthStr) - 1
      const year = yearStr ? Number(yearStr.length === 2 ? `20${yearStr}` : yearStr) : new Date().getFullYear()
      parsed = new Date(year, month, day)
    } else {
      const fallback = new Date(value)
      parsed = Number.isNaN(fallback.getTime()) ? null : fallback
    }

    if (parsed && !Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    return value
  }

  useEffect(() => {
    loadAulas()
    loadTurmas()
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current)
    }
  }, [])

  function showToast(type: 'success' | 'error', message: string) {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast({ type, message })
    toastTimeout.current = setTimeout(() => {
      setToast(null)
      toastTimeout.current = null
    }, 4000)
  }

  async function loadAulas() {
    try {
      setLoading(true)
      setError(null)
      console.log('📡 Carregando aulas...')
      const response = await aulasAPI.list()
      console.log('✅ Aulas carregadas:', response)
      const normalized = (response.items || []).map((item) => normalizeAula(item))
      setAulas(normalized)
    } catch (err: any) {
      console.error('❌ Erro ao carregar aulas:', err)
      const errorMessage = err?.message || 'Erro desconhecido'
      if (errorMessage.includes('503')) {
        const message = 'Banco de dados não configurado. Configure a conexão com o banco no backend.'
        setError(message)
        showToast('error', message)
      } else if (errorMessage.includes('Failed to fetch')) {
        const message = 'Não foi possível conectar ao backend. Verifique se o servidor está rodando na porta 8000.'
        setError(message)
        showToast('error', message)
      } else {
        const message = `Erro ao carregar aulas: ${errorMessage}`
        setError(message)
        showToast('error', message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadTurmas() {
    try {
      setLoadingTurmas(true)
      setTurmasError(null)
      const response = await turmasAPI.list()
      setTurmas(response.items || [])
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido'
      setTurmasError(errorMessage)
    } finally {
      setLoadingTurmas(false)
    }
  }

  async function handleCreateAula(formData: AulaFormState) {
    try {
      console.log('📝 Criando nova aula:', formData)
      const response = await aulasAPI.create({
        assunto: formData.assunto,
        turma: formData.turma,
        turma_id: formData.turma_id,
        data: formData.data,
        descricao: formData.descricao,
        arquivo: formData.arquivo
      })
      console.log('✅ Aula criada:', response)
      
      // Adiciona a nova aula à lista
      const novaAula = normalizeAula(response.aula, formData)
      setAulas(prev => [...prev, novaAula])
      setIsOpen(false)
      showToast('success', 'Aula criada com sucesso!')
    } catch (err: any) {
      console.error('❌ Erro ao criar aula:', err)
      const errorMessage = err?.message || 'Erro desconhecido'
      if (errorMessage.includes('503')) {
        showToast('error', 'Banco de dados não configurado. Configure a conexão com o banco no backend.')
      } else if (errorMessage.includes('Failed to fetch')) {
        showToast('error', 'Não foi possível conectar ao backend. Verifique se o servidor está rodando.')
      } else {
        showToast('error', `Erro ao criar aula: ${errorMessage}`)
      }
    }
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`px-5 py-3 rounded-2xl border-2 shadow-lg transition-all ${
              toast.type === 'success'
                ? 'bg-[#E0F5EC] border-[#32D583] text-[#054F31]'
                : 'bg-[#FEE4E2] border-[#FDA29B] text-[#7A271A]'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <section className="panel-blue rounded-tl-none p-8 -mt-px">
        <div className="flex items-center justify-end mb-6">
          <button
            className="px-6 py-3 rounded-2xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
            onClick={() => setIsOpen(true)}
          >
            + Adicionar Aula
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <div className="border-2 border-[#EFB4C8] rounded-3xl p-6 bg-transparent">
            <p className="text-[#01162A] text-center">{error}</p>
            <button
              onClick={loadAulas}
              className="mt-4 mx-auto block px-6 py-2 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Calendar value={selectedDate} onChange={setSelectedDate} aulas={aulas} />
            </div>
            
            <div className="lg:col-span-2 space-y-4">
              {aulas.length === 0 && (
                <div className="border-2 border-[#C5C5C5] rounded-3xl p-8 bg-transparent text-center">
                  <p className="text-[#01162A] text-lg">Nenhuma aula encontrada.</p>
                </div>
              )}
              {aulas.map((a) => (
              <div 
                key={a.id} 
                className="border-2 border-[#6BAED6] rounded-3xl p-6 bg-transparent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                        <h3 className="font-semibold text-xl text-[#01162A] mb-1">
                          {a.titulo || 'Aula sem título'}
                        </h3>
                        <p className="text-[#01162A] text-sm">
                          {formatDateLabel(a.data)}
                        </p>
                  </div>
                  <button 
                    className="px-5 py-2.5 rounded-xl bg-[#6BAED6] text-white font-medium hover:bg-[#3B82C8] transition-colors"
                    onClick={() => router.push(`/aulas/${a.id}`)}
                  >
                    Abrir
                  </button>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <CreateAulaModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={handleCreateAula}
        turmas={turmas}
        loadingTurmas={loadingTurmas}
        turmasError={turmasError}
        onRetryTurmas={loadTurmas}
      />
    </div>
  )
}

