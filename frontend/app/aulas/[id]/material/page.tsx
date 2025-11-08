'use client'

import Tabs from '@components/Tabs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { generateLessonMaterial } from '@features/lesson-generation/agent'

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
  const [openFeedback, setOpenFeedback] = useState(false)

  const assunto = params.get('assunto') || 'Material tema aula'
  const descricao = params.get('descricao') || ''
  const turma = params.get('turma') || ''
  const data = params.get('data') || ''
  const feedback = params.get('feedback') || undefined

  const material = useMemo(
    () => generateLessonMaterial({ assunto, descricao, turma, data, feedback }),
    [assunto, descricao, turma, data, feedback]
  )

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


