'use client'

import Tabs from '@components/Tabs'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AulaDetalhePage() {
  const router = useRouter()
  const params = useSearchParams()

  const assunto = params.get('assunto') || 'Tema da aula'
  const descricao = params.get('descricao') || 'descrição'

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas', active: true }
        ]}
      />

      <div className="space-y-6">
        <section className="card p-5">
          <div className="text-xl font-semibold mb-2">{assunto}</div>
          <div className="text-neutral-600">{descricao}</div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="card p-5">
            <div className="text-lg font-semibold mb-4">Estudantes</div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border border-neutral-200 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-neutral-300" />
                    <div>
                      <div className="font-medium">Aluno {i}</div>
                      <div className="text-sm text-neutral-500">
                        mini descrição
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5 flex flex-col items-center justify-center text-center">
            <div className="text-lg font-semibold mb-3">Material</div>
            <div className="text-red-600 mb-4">
              Você ainda não criou o material
            </div>
            <button
              className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                const search = params.toString()
                router.push(`./gerando?${search}`)
              }}
            >
              criar material
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}


