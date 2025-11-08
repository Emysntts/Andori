'use client'

import { useMemo, useState } from 'react'
import Tabs from '@components/Tabs'
import { useRouter } from 'next/navigation'

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
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="text-xl font-semibold">Criar aula</div>
          </div>
          <form
            className="p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              onCreate(form)
              onClose()
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                assunto da aula
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.assunto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assunto: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  turma
                </label>
                <input
                  type="text"
                  placeholder="ex: 4º ano A"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  value={form.turma}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, turma: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  data
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  value={form.data}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, data: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                descrição
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.descricao}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                upload arquivo
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    arquivo: e.target.files?.[0] ?? null
                  }))
                }
                className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                criar
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
          { href: '/aulas', label: 'aulas', active: true }
        ]}
      />

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="text-lg font-semibold">Aulas</div>
          <button
            className="px-3 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setIsOpen(true)}
          >
            add aula
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 card h-64 flex items-center justify-center text-neutral-500">
            calendário
          </div>
          <div className="md:col-span-2 space-y-4">
            {aulas.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="font-medium">{a.titulo}</div>
                <div className="text-neutral-500 text-sm">{a.data}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
 
