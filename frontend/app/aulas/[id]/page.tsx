'use client'

import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type DesempenhoAluno = {
  alunoId: number
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
  onSave
}: {
  open: boolean
  onClose: () => void
  onSave: (data: DesempenhoData) => void
}) {
  const [materialUtil, setMaterialUtil] = useState<string>('')
  const [alunosDesempenho, setAlunosDesempenho] = useState<Record<number, string[]>>({})
  const [observacoes, setObservacoes] = useState('')

  const alunos = [
    { id: 1, nome: 'Aluno 1' },
    { id: 2, nome: 'Aluno 2' },
    { id: 3, nome: 'Aluno 3' }
  ]

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

  const toggleAlunoDesempenho = (alunoId: number, value: string) => {
    setAlunosDesempenho(prev => {
      const current = prev[alunoId] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [alunoId]: updated }
    })
  }

  const handleSave = () => {
    const data: DesempenhoData = {
      materialUtil,
      alunos: Object.entries(alunosDesempenho).map(([id, desempenho]) => ({
        alunoId: Number(id),
        desempenho: desempenho || []
      })),
      observacoes
    }
    onSave(data)
    onClose()
  }

  if (!open) return null

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
              handleSave()
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
              <div className="space-y-3">
                {alunos.map((aluno) => (
                  <div key={aluno.id} className="border-2 border-[#C5C5C5] rounded-2xl p-4">
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
                ))}
              </div>
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

            <div className="flex items-center justify-end gap-3 pt-3 pb-2 sticky bottom-0 bg-[#FFFEF1]">
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
                Salvar Desempenho
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
  const params = useSearchParams()
  const route = useParams<{ id: string }>()
  const [hasMaterial, setHasMaterial] = useState(false)
  const [materialData, setMaterialData] = useState<any>(null)
  const [openDesempenho, setOpenDesempenho] = useState(false)
  const [desempenhoSalvo, setDesempenhoSalvo] = useState<DesempenhoData | null>(null)

  const assunto = params.get('assunto') || 'Tema da aula'
  const descricao = params.get('descricao') || 'descrição'

  useEffect(() => {
    const id = route?.id
    if (id) {
      const materialAccepted = localStorage.getItem(`material:${id}:accepted`)
      setHasMaterial(!!materialAccepted)
      
      // Carregar dados do material se existir
      if (materialAccepted) {
        const materialRaw = sessionStorage.getItem(`material:${id}`)
        if (materialRaw) {
          try {
            setMaterialData(JSON.parse(materialRaw))
          } catch {
            setMaterialData(null)
          }
        }
        
        // Carregar desempenho salvo se existir
        const desempenhoRaw = localStorage.getItem(`desempenho:${id}`)
        if (desempenhoRaw) {
          try {
            setDesempenhoSalvo(JSON.parse(desempenhoRaw))
          } catch {
            setDesempenhoSalvo(null)
          }
        }
      } else {
        setMaterialData(null)
        setDesempenhoSalvo(null)
      }
    }
  }, [route?.id, params])

  const handleSaveDesempenho = (data: DesempenhoData) => {
    const id = route?.id
    if (id) {
      localStorage.setItem(`desempenho:${id}`, JSON.stringify(data))
      setDesempenhoSalvo(data)
    }
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
        
        <div className="space-y-6">
          <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
            <h1 className="text-2xl font-bold text-[#01162A] mb-3">{assunto}</h1>
            <p className="text-[#01162A]">{descricao}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
              <h2 className="text-xl font-bold text-[#01162A] mb-4">Material</h2>
              {hasMaterial && materialData ? (
                <div className="space-y-4">
                  <div className="bg-[#F4D35E]/10 border border-[#F4D35E] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-[#F4D35E]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold text-[#01162A]">Material criado e aprovado</span>
                    </div>
                    <p className="text-sm text-[#01162A]/70 mb-3">
                      Persona: {materialData.persona?.label || 'N/A'} — {materialData.persona?.hyperfocus || 'N/A'}
                    </p>
                    <div className="text-sm text-[#01162A]/80">
                      <div className="mb-2">✓ Recomendações gerais</div>
                      <div className="mb-2">✓ Roteiro da aula</div>
                      <div className="mb-2">✓ Resumo do conteúdo</div>
                      {materialData.exemplos && <div className="mb-2">✓ Exemplos prontos</div>}
                      {materialData.perguntas && <div className="mb-2">✓ Perguntas para checagem</div>}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      className="flex-1 px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
                      onClick={() => {
                        const id = route?.id
                        const search = params.toString()
                        router.push(`/aulas/${id}/material?${search}`)
                      }}
                    >
                      Ver Material Completo
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
                        if (id) {
                          sessionStorage.removeItem(`material:${id}`)
                          localStorage.removeItem(`material:${id}:accepted`)
                        }
                        const newParams = new URLSearchParams(params.toString())
                        newParams.set('_t', Date.now().toString())
                        router.push(`/aulas/${id}/gerando?${newParams.toString()}`)
                      }}
                    >
                      Editar
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
                </div>
              )}
            </div>

            {/* Seção de Desempenho - só aparece se tiver material */}
            {hasMaterial && (
              <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
                <h2 className="text-xl font-bold text-[#01162A] mb-4">Desempenho</h2>
                {desempenhoSalvo ? (
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
                      onClick={() => setOpenDesempenho(true)}
                    >
                      Editar Desempenho
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[#01162A]/70 mb-4 text-sm">
                      Registre o desempenho dos alunos nesta aula
                    </p>
                    <button
                      className="w-full px-6 py-3 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
                      onClick={() => setOpenDesempenho(true)}
                    >
                      Registrar Desempenho
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <DesempenhoDialog
        open={openDesempenho}
        onClose={() => setOpenDesempenho(false)}
        onSave={handleSaveDesempenho}
      />
    </div>
  )
}


