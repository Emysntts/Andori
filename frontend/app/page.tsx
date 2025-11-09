'use client'

import Tabs from '@components/Tabs'
import StudentCard from '@components/StudentCard'
import { useState, useEffect } from 'react'
import { turmasAPI } from '@lib/api'

type Aluno = {
  id: string
  nome: string
}

type Turma = {
  id: string
  nome: string
  alunos?: Aluno[]
}

export default function AulasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTurmas()
  }, [])

  async function loadTurmas() {
    try {
      setLoading(true)
      setError(null)
      console.log('Iniciando requisição para buscar turmas...')
      const response = await turmasAPI.list()
      console.log('Resposta recebida:', response)
      const turmasData: Turma[] = response.items || []
      
      // Carregar alunos de cada turma
      const turmasComAlunos = await Promise.all(
        turmasData.map(async (turma) => {
          try {
            const studentsResponse = await turmasAPI.getStudents(turma.id)
            return {
              ...turma,
              alunos: studentsResponse.items || []
            }
          } catch (err) {
            console.error(`Erro ao carregar alunos da turma ${turma.id}:`, err)
            return {
              ...turma,
              alunos: []
            }
          }
        })
      )
      
      setTurmas(turmasComAlunos)
      
      // Define a primeira turma como aberta por padrão
      if (turmasComAlunos.length > 0) {
        setOpenIds({ [turmasComAlunos[0].id]: true })
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar turmas:', err)
      const errorMessage = err?.message || 'Erro desconhecido'
      if (errorMessage.includes('503')) {
        setError('Banco de dados não configurado. Configure a conexão com o banco no backend.')
      } else if (errorMessage.includes('Failed to fetch')) {
        setError('Não foi possível conectar ao backend. Verifique se o servidor está rodando na porta 8000.')
      } else {
        setError(`Erro ao carregar turmas: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  function toggle(id: string) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <section className="panel rounded-tl-none p-8 -mt-px">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <div className="border-2 border-[#EFB4C8] rounded-3xl p-6 bg-transparent">
            <p className="text-[#01162A] text-center">{error}</p>
            <button
              onClick={loadTurmas}
              className="mt-4 mx-auto block px-6 py-2 rounded-xl bg-[#6BAED6] text-white font-semibold hover:bg-[#3B82C8] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && turmas.length === 0 && (
          <div className="border-2 border-[#C5C5C5] rounded-3xl p-8 bg-transparent text-center">
            <p className="text-[#01162A] text-lg">Nenhuma turma encontrada.</p>
          </div>
        )}

        {!loading && !error && turmas.length > 0 && (
          <div className="space-y-6">
            {turmas.map((turma) => {
              const isOpen = openIds[turma.id]
              return (
                <div
                  key={turma.id}
                  className="rounded-3xl border-2 border-[#C5C5C5] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(turma.id)}
                    className="w-full flex items-center justify-between px-8 py-6 bg-transparent"
                  >
                    <span className="text-[#01162A] text-2xl font-medium">{turma.nome}</span>
                    <svg
                      className={`h-7 w-7 text-[#3B82C8] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-8 pb-8 pt-4 bg-[#FFFEF1]">
                      {turma.alunos && turma.alunos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {turma.alunos.map((a) => (
                            <StudentCard key={a.id} id={a.id} name={a.nome} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#01162A]/70 text-center py-4">
                          Nenhum aluno nesta turma.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

