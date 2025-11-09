'use client'

import { useMemo, useState } from 'react'
import Tabs from '@components/Tabs'
import { useRouter } from 'next/navigation'
import Calendar from '@components/Calendar'

type Aula = { id: string; titulo: string; data: string }

type AulaFormState = {
  assunto: string
  turma: string
  data: string
  descricao: string
  arquivo: File | null
}

function CreateAulaModal({
  open,
  onClose,
  onCreate
}: {
  open: boolean
  onClose: () => void
  onCreate: (payload: AulaFormState) => void
}) {
  const [form, setForm] = useState<AulaFormState>({
    assunto: '',
    turma: '',
    data: '',
    descricao: '',
    arquivo: null
  })
 
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
              onCreate(form)
              onClose()
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
                <input
                  type="text"
                  placeholder="ex: 4º ano A"
                  className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 focus:outline-none focus:border-[#6BAED6] bg-transparent text-[#01162A] placeholder:text-[#C5C5C5]"
                  value={form.turma}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, turma: e.target.value }))
                  }
                  required
                />
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
  const [aulas, setAulas] = useState<Aula[]>([
    { id: 'a1', titulo: 'Aula de Capitalismo', data: '17/06' },
    { id: 'a2', titulo: 'Aula de História do Brasil', data: '20/06' }
  ])

  const nextId = useMemo(
    () => `a${(aulas.length + 1).toString()}`,
    [aulas.length]
  )

  return (
    <div>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Calendar value={selectedDate} onChange={setSelectedDate} aulas={aulas} />
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            {aulas.map((a) => (
              <div 
                key={a.id} 
                className="border-2 border-[#6BAED6] rounded-3xl p-6 bg-transparent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xl text-[#01162A] mb-1">{a.titulo}</h3>
                    <p className="text-[#01162A] text-sm">{a.data}</p>
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
      </section>

      <CreateAulaModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={(payload) => {
          const dataLabel = payload.data
            ? new Date(payload.data).toLocaleDateString('pt-BR')
            : ''
          const newId = nextId
          setAulas((prev) => [
            {
              id: newId,
              titulo: payload.assunto || 'Nova aula',
              data: dataLabel
            },
            ...prev
          ])
          const params = new URLSearchParams({
            assunto: payload.assunto,
            descricao: payload.descricao,
            data: payload.data,
            turma: payload.turma
          })
          router.push(`/aulas/${newId}?${params.toString()}`)
        }}
      />
    </div>
  )
}
 
