'use client'

import Tabs from '@components/Tabs'
import StudentCard from '@components/StudentCard'
import { useEffect, useState } from 'react'

const data = [
  {
    id: '4a',
    nome: '4º ano A',
    alunos: [
      { id: 1, nome: 'aluno 1' },
      { id: 2, nome: 'aluno 2' }
    ]
  },
  {
    id: '4b',
    nome: '4º ano B',
    alunos: [
      { id: 3, nome: 'aluno 1' },
      { id: 4, nome: 'aluno 1' }
    ]
  }
]

export default function TurmasPage() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(
    Object.fromEntries(data.map((t) => [t.id, false]))
  )

  useEffect(() => {
    const docEl = document.documentElement
    const previousPanel = getComputedStyle(docEl).getPropertyValue('--panel-bg')
    const turmasPanel = '#254E93' // deep blue for Turmas container
    docEl.style.setProperty('--panel-bg', turmasPanel)
    return () => {
      if (previousPanel) {
        docEl.style.setProperty('--panel-bg', previousPanel)
      } else {
        docEl.style.removeProperty('--panel-bg')
      }
    }
  }, [])

  function toggle(id: string) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas', active: true },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <section className="panel rounded-tl-none p-4 md:p-6 -mt-px">
        <div className="space-y-4">
          {data.map((turma) => {
            const isOpen = openIds[turma.id]
            return (
              <div
                key={turma.id}
                className="rounded-2xl bg-brand-50/40"
              >
                <button
                  type="button"
                  onClick={() => toggle(turma.id)}
                  className="w-full flex items-center justify-between px-5 py-4"
                >
                  <span className="text-white text-lg">{turma.nome}</span>
                  <svg
                    className={`h-5 w-5 text-white transition-transform ${
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
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

