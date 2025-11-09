'use client'

import Tabs from '@components/Tabs'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type Roteiro = {
  topicos: string[]
  falas: string[]
  exemplos: string[]
}

type Resumo = {
  texto: string
  exemplo: string
}

type GenerateMaterialResponse = {
  roteiro: Roteiro
  resumo: Resumo
  source: string
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
  const [materialFromBackend, setMaterialFromBackend] = useState<GenerateMaterialResponse | null>(null)
  const [isAccepted, setIsAccepted] = useState(false)

  const assunto = params.get('assunto') || 'Material tema aula'
  const descricao = params.get('descricao') || ''
  const turma = params.get('turma') || ''
  const data = params.get('data') || ''
  const feedback = params.get('feedback') || undefined

  useEffect(() => {
    const id = route?.id
    if (!id) return
    
    // Verificar se o material já foi aceito
    const accepted = localStorage.getItem(`material:${id}:accepted`)
    setIsAccepted(!!accepted)
    
    const raw = sessionStorage.getItem(`material:${id}`)
    if (raw) {
      try {
        const parsed: GenerateMaterialResponse = JSON.parse(raw)
        setMaterialFromBackend(parsed)
      } catch {
        setMaterialFromBackend(null)
      }
    }
  }, [route])

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
            <p className="text-sm text-[#01162A]/70">{turma || 'Turma não informada'} {data ? `— ${data}` : ''}</p>
          </div>
          <div className="flex gap-3">
            {isAccepted ? (
              <>
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
              </>
            ) : (
              <>
                <button
                  className="px-6 py-3 rounded-xl border-2 border-[#F4D35E] text-[#F4D35E] font-semibold hover:bg-[#F4D35E]/10 transition-colors"
                  onClick={() => setOpenFeedback(true)}
                >
                  Gerar Novamente
                </button>
                <button
                  className="px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
                  onClick={() => {
                    const id = route?.id
                    if (id) {
                      // Salvar material aceito no localStorage
                      localStorage.setItem(`material:${id}:accepted`, 'true')
                      // Voltar para página da aula
                      const urlParams = new URLSearchParams(params.toString())
                      router.push(`/aulas/${id}?${urlParams.toString()}&refresh=${Date.now()}`)
                    }
                  }}
                >
                  Aceitar Material
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {!materialFromBackend ? (
            <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent">
              <p className="text-[#01162A]">Nenhum material disponível. Tente gerar novamente.</p>
            </div>
          ) : (
            <>
              <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent">
                <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Roteiro da aula</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-[#01162A] mb-2">Tópicos</h4>
                    <List items={materialFromBackend.roteiro?.topicos} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#01162A] mb-2">Falas</h4>
                    <List items={materialFromBackend.roteiro?.falas} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#01162A] mb-2">Exemplos</h4>
                    <List items={materialFromBackend.roteiro?.exemplos} />
                  </div>
                </div>
              </div>
              
            <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent">
                <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Resumo do conteúdo</h3>
                <div className="space-y-3 text-[#01162A]">
                  <p className="whitespace-pre-line leading-relaxed">{materialFromBackend.resumo?.texto}</p>
                  {materialFromBackend.resumo?.exemplo && (
                    <p className="italic">Exemplo: {materialFromBackend.resumo.exemplo}</p>
                  )}
                </div>
            </div>
            </>
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


