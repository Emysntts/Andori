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
        <div className="w-full max-w-2xl bg-[#FFFEF1] rounded-3xl border-2 border-[#6BAED6]">
          <div className="px-8 py-6 border-b-2 border-[#C5C5C5]">
            <h2 className="text-2xl font-bold text-[#01162A]">Como o material pode melhorar?</h2>
          </div>
          <div className="p-8 space-y-5">
            <textarea
              rows={5}
              className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 focus:outline-none focus:border-[#6BAED6] bg-transparent text-[#01162A] resize-none placeholder:text-[#C5C5C5]"
              placeholder="ex: dar mais exemplos locais, simplificar a linguagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                className="px-6 py-3 rounded-xl border-2 border-[#C5C5C5] text-[#01162A] font-semibold hover:bg-[#C5C5C5]/20 transition-colors"
                onClick={onCancel}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
                onClick={() => onConfirm(text)}
              >
                Gerar Material
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
      <ul className="list-disc pl-6 space-y-2 text-[#01162A]">
        {items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className="container-page py-4">
      <div className="border-2 border-[#F4D35E] rounded-3xl p-8 bg-[#FFFEF1]">
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
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#01162A] mb-2">{assunto}</h1>
            <p className="text-sm text-[#01162A]/70">
              Persona: {material.persona.label} — hiperfoco em {material.persona.hyperfocus}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-6 py-3 rounded-xl border-2 border-[#F4D35E] text-[#F4D35E] font-semibold hover:bg-[#F4D35E]/10 transition-colors"
              onClick={() => setOpenFeedback(true)}
            >
              editar
            </button>
            <button
              className="px-6 py-3 rounded-xl border-2 border-[#EFB4C8] text-[#EFB4C8] font-semibold hover:bg-[#EFB4C8]/10 transition-colors"
              onClick={() => {
                const id = route?.id
                if (id) {
                  // Limpar completamente o material
                  localStorage.removeItem(`material:${id}:accepted`)
                  sessionStorage.removeItem(`material:${id}`)
                  // Adicionar parâmetro para forçar refresh na página da aula
                  router.push(`/aulas/${id}?refresh=${Date.now()}`)
                }
              }}
            >
              excluir
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent min-h-[200px]">
            <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Recomendações gerais</h3>
            <p className="text-[#01162A] whitespace-pre-line leading-relaxed">{material.recomendacoes}</p>
          </div>
          
          <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent min-h-[300px]">
            <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Roteiro da aula</h3>
            <p className="text-[#01162A] whitespace-pre-line leading-relaxed">{material.roteiro}</p>
          </div>
          
          <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent min-h-[250px]">
            <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Resumo do conteúdo</h3>
            <p className="text-[#01162A] whitespace-pre-line leading-relaxed">{material.resumo}</p>
          </div>
          
          {material.exemplos && (
            <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent">
              <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Exemplos prontos para usar em aula</h3>
              <List items={material.exemplos} />
            </div>
          )}
          
          {material.perguntas && (
            <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent">
              <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Perguntas para checagem</h3>
              <List items={material.perguntas} />
            </div>
          )}
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


