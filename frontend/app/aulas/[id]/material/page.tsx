'use client'

import Tabs from '@components/Tabs'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { generateLessonMaterial, LessonMaterial } from '@features/lesson-generation/agent'

function toText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map((v) => toText(v)).join('\n')
  if (value && typeof value === 'object') {
    try {
      return Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `${k.split('_').join(' ')}: ${toText(v)}`)
        .join('\n')
    } catch {
      return JSON.stringify(value)
    }
  }
  return String(value ?? '')
}

function FeedbackModal({
  open,
  onCancel,
  onConfirm
}: {
  open: boolean
  onCancel: () => void
  onConfirm: (feedback: string) => void
}) {
  const [text, setText] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200 text-xl font-semibold">
            Como o material pode melhorar?
          </div>
          <div className="p-6 space-y-4">
            <textarea
              rows={5}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="ex: dar mais exemplos locais, simplificar a linguagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                className="px-3 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                onClick={onCancel}
              >
                cancelar
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => onConfirm(text)}
              >
                gerar material
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MaterialGeradoPage() {
  const router = useRouter()
  const params = useSearchParams()
  const route = useParams<{ id: string }>()
  const [openFeedback, setOpenFeedback] = useState(false)
  const [materialFromAgent, setMaterialFromAgent] = useState<LessonMaterial | null>(null)

  const assunto = params.get('assunto') || 'Material tema aula'
  const descricao = params.get('descricao') || ''
  const turma = params.get('turma') || ''
  const data = params.get('data') || ''
  const feedback = params.get('feedback') || undefined

  const fallbackMaterial = useMemo(
    () => generateLessonMaterial({ assunto, descricao, turma, data, feedback }),
    [assunto, descricao, turma, data, feedback]
  )

  useEffect(() => {
    const id = route?.id
    if (!id) return
    const raw = sessionStorage.getItem(`material:${id}`)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        const normalized: LessonMaterial = {
          ...parsed,
          recomendacoes: toText(parsed?.recomendacoes),
          roteiro: toText(parsed?.roteiro),
          resumo: toText(parsed?.resumo)
        }
        setMaterialFromAgent(normalized)
      } catch {
        setMaterialFromAgent(null)
      }
    }
  }, [route])

  const material = materialFromAgent ?? fallbackMaterial

  function List({ items }: { items: string[] | undefined | null }) {
    if (!items || items.length === 0) return null
    return (
      <ul className="list-disc pl-6 space-y-1 text-neutral-800">
        {items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    )
  }

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas', active: true }
        ]}
      />

      <div className="space-y-6">
        <div className="text-2xl font-semibold">{assunto}</div>
        <div className="text-sm text-neutral-600">
          Persona: {material.persona.label} — hiperfoco em {material.persona.hyperfocus}
        </div>

        <section className="space-y-4">
          <div className="card p-5 bg-neutral-50">{material.recomendacoes}</div>
          <div className="card p-5 bg-neutral-50 whitespace-pre-line">
            {material.roteiro}
          </div>
          <div className="card p-5 bg-neutral-50">{material.resumo}</div>
          {material.exemplos && (
            <div className="card p-5 bg-neutral-50">
              <div className="font-medium mb-2">Exemplos prontos para usar em aula</div>
              <List items={material.exemplos} />
            </div>
          )}
          {material.perguntas && (
            <div className="card p-5 bg-neutral-50">
              <div className="font-medium mb-2">Perguntas para checagem</div>
              <List items={material.perguntas} />
            </div>
          )}
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => setOpenFeedback(true)}
          >
            gerar novamente
          </button>
          <button
            className="px-4 py-2 rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => {
              const search = params.toString()
              router.push(`../?${search}`)
            }}
          >
            Aceitar material
          </button>
        </div>
      </div>

      <FeedbackModal
        open={openFeedback}
        onCancel={() => setOpenFeedback(false)}
        onConfirm={(text) => {
          const q = new URLSearchParams(params.toString())
          q.set('feedback', text)
          router.push(`../gerando?${q.toString()}`)
        }}
      />
    </div>
  )
}


