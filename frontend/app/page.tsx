'use client'

import Tabs from '@components/Tabs'
import StudentCard from '@components/StudentCard'
import { useState } from 'react'

const data = [
  {
    id: '4a',
    nome: '4 série A',
    alunos: [
      { id: 1, nome: 'Pedro Henrique' },
      { id: 2, nome: 'Pedro Henrique' }
    ]
  },
  {
    id: '4b',
    nome: '4 série B',
    alunos: [
      { id: 3, nome: 'Pedro Henrique' },
      { id: 4, nome: 'Pedro Henrique' }
    ]
  }
]

export default function AulasPage() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    '4a': false,
    '4b': true
  })

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
        <div className="space-y-6">
          {data.map((turma) => {
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {turma.alunos.map((a) => (
                        <StudentCard key={a.id} id={a.id} name={a.nome} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

