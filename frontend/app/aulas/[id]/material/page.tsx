'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { materialAPI, type MaterialItem } from '@lib/api'

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

const toGenerateMaterialResponse = (material: MaterialItem): GenerateMaterialResponse => ({
  roteiro: {
    topicos: material.roteiro?.topicos ?? [],
    falas: material.roteiro?.falas ?? [],
    exemplos: material.roteiro?.exemplos ?? []
  },
  resumo: {
    texto: material.resumo?.texto ?? '',
    exemplo: material.resumo?.exemplo ?? ''
  },
  source: material.source ?? 'openai'
})

export default function MaterialGeradoPage() {
  const router = useRouter()
  const params = useSearchParams()
  const route = useParams<{ id: string }>()
  const [openFeedback, setOpenFeedback] = useState(false)
  const [sessionMaterial, setSessionMaterial] = useState<GenerateMaterialResponse | null>(null)
  const [acceptedMaterial, setAcceptedMaterial] = useState<MaterialItem | null>(null)
  const [materialError, setMaterialError] = useState<string | null>(null)
  const [loadingMaterial, setLoadingMaterial] = useState(false)
  const [savingMaterial, setSavingMaterial] = useState(false)

  const assunto = params.get('assunto') || 'Material tema aula'
  const descricao = params.get('descricao') || ''
  const turma = params.get('turma') || ''
  const data = params.get('data') || ''
  const feedback = params.get('feedback') || undefined

  useEffect(() => {
    const id = route?.id
    if (!id) return

    const raw = sessionStorage.getItem(`material:${id}`)
    if (raw) {
      try {
        const parsed: GenerateMaterialResponse = JSON.parse(raw)
        setSessionMaterial(parsed)
      } catch {
        setSessionMaterial(null)
      }
    }
  }, [route])

  useEffect(() => {
    const id = route?.id
    if (!id) return
    let cancelled = false

    const loadAcceptedMaterial = async () => {
      setLoadingMaterial(true)
      setMaterialError(null)
      try {
        const materials = await materialAPI.listByAula(id)
        if (cancelled) return
        setAcceptedMaterial(materials[0] ?? null)
      } catch (err: any) {
        if (cancelled) return
        console.error('❌ Erro ao carregar material aceito:', err)
        setMaterialError('Não foi possível carregar o material salvo.')
        setAcceptedMaterial(null)
      } finally {
        if (!cancelled) {
          setLoadingMaterial(false)
        }
      }
    }

    loadAcceptedMaterial()

    return () => {
      cancelled = true
    }
  }, [route])

  const aulaId = useMemo(() => {
    const raw = route?.id
    if (Array.isArray(raw)) return raw[0]
    return raw ?? null
  }, [route])

  const isAccepted = Boolean(acceptedMaterial)
  const materialToDisplay = useMemo<GenerateMaterialResponse | null>(() => {
    if (acceptedMaterial) {
      return toGenerateMaterialResponse(acceptedMaterial)
    }
    return sessionMaterial
  }, [acceptedMaterial, sessionMaterial])

  const handleAcceptMaterial = async () => {
    if (!aulaId || !sessionMaterial) {
      setMaterialError('Nenhum material gerado para salvar.')
      return
    }
    setSavingMaterial(true)
    setMaterialError(null)
    try {
      const saved = await materialAPI.accept({
        aula_id: aulaId,
        roteiro: sessionMaterial.roteiro,
        resumo: sessionMaterial.resumo,
        source: sessionMaterial.source
      })
      setAcceptedMaterial(saved)
      setSessionMaterial(null)
      sessionStorage.removeItem(`material:${aulaId}`)
    } catch (err: any) {
      console.error('❌ Erro ao aceitar material:', err)
      setMaterialError(err?.message || 'Não foi possível salvar o material.')
    } finally {
      setSavingMaterial(false)
    }
  }

  const handleDeleteMaterial = async () => {
    if (!acceptedMaterial) return
    setSavingMaterial(true)
    setMaterialError(null)
    try {
      await materialAPI.delete(acceptedMaterial.id)
      setAcceptedMaterial(null)
      sessionStorage.removeItem(`material:${acceptedMaterial.aula_id}`)
      router.push(`/aulas/${acceptedMaterial.aula_id}?refresh=${Date.now()}`)
    } catch (err: any) {
      console.error('❌ Erro ao excluir material:', err)
      setMaterialError(err?.message || 'Não foi possível excluir o material.')
    } finally {
      setSavingMaterial(false)
    }
  }

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
              <button
                className="px-6 py-3 rounded-xl bg-[#EFB4C8] text-white font-semibold hover:bg-[#DA81A5] transition-colors disabled:opacity-50"
                onClick={handleDeleteMaterial}
                disabled={savingMaterial}
              >
                excluir material
              </button>
            ) : (
              <button
                className="px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAcceptMaterial}
                disabled={savingMaterial || !sessionMaterial}
              >
                {savingMaterial ? 'Salvando...' : 'Criar material'}
              </button>
            )}
          </div>
        </div>

        {materialError && (
          <div className="mb-4 rounded-2xl border-2 border-[#EFB4C8] bg-[#EFB4C8]/10 px-4 py-3 text-[#01162A]">
            {materialError}
          </div>
        )}
        <div className="space-y-6">
          {loadingMaterial && !materialToDisplay ? (
            <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
            </div>
          ) : !materialToDisplay ? (
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
                    <List items={materialToDisplay.roteiro?.topicos} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#01162A] mb-2">Falas</h4>
                    <List items={materialToDisplay.roteiro?.falas} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#01162A] mb-2">Exemplos</h4>
                    <List items={materialToDisplay.roteiro?.exemplos} />
                  </div>
                </div>
              </div>

              <div className="border-2 border-[#01162A] rounded-[2.5rem] p-8 bg-transparent">
                <h3 className="font-bold text-2xl text-[#01162A] mb-4 text-center">Resumo do conteúdo</h3>
                <div className="space-y-3 text-[#01162A]">
                  <p className="whitespace-pre-line leading-relaxed">{materialToDisplay.resumo?.texto}</p>
                  {materialToDisplay.resumo?.exemplo && (
                    <p className="italic">Exemplo: {materialToDisplay.resumo.exemplo}</p>
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


