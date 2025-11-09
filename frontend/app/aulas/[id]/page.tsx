'use client'

import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AulaDetalhePage() {
  const router = useRouter()
  const params = useSearchParams()
  const route = useParams<{ id: string }>()
  const [hasMaterial, setHasMaterial] = useState(false)

  const assunto = params.get('assunto') || 'Tema da aula'
  const descricao = params.get('descricao') || 'descrição'

  useEffect(() => {
    const id = route?.id
    if (id) {
      const materialAccepted = localStorage.getItem(`material:${id}:accepted`)
      setHasMaterial(!!materialAccepted)
    }
  }, [route?.id, params])

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
        
        <div className="space-y-6">
          <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
            <h1 className="text-2xl font-bold text-[#01162A] mb-3">{assunto}</h1>
            <p className="text-[#01162A]">{descricao}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
              <h2 className="text-xl font-bold text-[#01162A] mb-4">Estudantes</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => {
                  const colors = ['#EFB4C8', '#6BAED6', '#3B82C8']
                  const borderColor = colors[(i - 1) % colors.length]
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 border-2 rounded-2xl px-4 py-3"
                      style={{ borderColor }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#C5C5C5]" />
                      <div>
                        <div className="font-semibold text-[#01162A]">Aluno {i}</div>
                        <div className="text-sm text-[#01162A]/70">
                          mini descrição
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold text-[#01162A] mb-3">Material</h2>
              {hasMaterial ? (
                <>
                  <p className="text-[#6BAED6] font-medium mb-6">
                    Material criado e aprovado ✓
                  </p>
                  <div className="flex gap-3">
                    <button
                      className="px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
                      onClick={() => {
                        const id = route?.id
                        const search = params.toString()
                        router.push(`/aulas/${id}/material?${search}`)
                      }}
                    >
                      Ver Material
                    </button>
                    <button
                      className="px-6 py-3 rounded-xl border-2 border-[#F4D35E] text-[#01162A] font-semibold hover:bg-[#F4D35E]/20 transition-colors"
                      onClick={() => {
                        const id = route?.id
                        // Limpar material anterior antes de editar/recriar
                        if (id) {
                          sessionStorage.removeItem(`material:${id}`)
                          localStorage.removeItem(`material:${id}:accepted`)
                        }
                        // Adicionar timestamp para forçar nova geração
                        const newParams = new URLSearchParams(params.toString())
                        newParams.set('_t', Date.now().toString())
                        router.push(`/aulas/${id}/gerando?${newParams.toString()}`)
                      }}
                    >
                      Editar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[#F4D35E] font-medium mb-6">
                    Você ainda não criou o material
                  </p>
                  <button
                    className="px-6 py-3 rounded-xl bg-[#F4D35E] text-[#01162A] font-semibold hover:bg-[#F4D35E]/80 transition-colors"
                    onClick={() => {
                      const id = route?.id
                      // Limpar qualquer material anterior antes de criar novo
                      if (id) {
                        sessionStorage.removeItem(`material:${id}`)
                        localStorage.removeItem(`material:${id}:accepted`)
                      }
                      // Adicionar timestamp para forçar nova geração
                      const newParams = new URLSearchParams(params.toString())
                      newParams.set('_t', Date.now().toString())
                      router.push(`/aulas/${id}/gerando?${newParams.toString()}`)
                    }}
                  >
                    Criar Material
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


