import Tabs from '@components/Tabs'

type Props = { params: { id: string } }

const performance = [
  { label: 'focado', color: 'bg-[#6BAED6]', value: 6 },
  { label: 'razoável', color: 'bg-[#EFB4C8]', value: 3 },
  { label: 'razoável', color: 'bg-[#F4D35E]', value: 3 },
  { label: 'disperso', color: 'bg-[#C5C5C5]', value: 5 }
]

export default function AlunoPage({ params }: Props) {
  const alunoNome = `Aluno ${params.id}`
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
          <div className="border-2 border-[#EFB4C8] rounded-3xl p-6 bg-transparent flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#C5C5C5]" />
            <h1 className="text-3xl font-bold text-[#01162A]">{alunoNome}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-[#EFB4C8] rounded-3xl p-6 bg-transparent md:col-span-2">
              <h2 className="text-xl font-bold text-[#01162A] mb-6">Desempenho</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-[#C5C5C5] rounded-2xl p-5 space-y-4">
                  {performance.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`inline-block w-4 h-4 rounded-full ${p.color}`} />
                      <span className="font-medium text-[#01162A]">{p.value} {p.label}</span>
                    </div>
                  ))}
                </div>
                <div className="border-2 border-[#C5C5C5] rounded-2xl p-5 flex items-center justify-center text-[#01162A]/50 font-medium">
                  gráfico
                </div>
              </div>
            </div>
            
            <div className="border-2 border-[#EFB4C8] rounded-3xl p-6 bg-transparent">
              <h2 className="text-xl font-bold text-[#01162A] mb-4">Aulas e Relatórios</h2>
              <div className="border-2 border-[#C5C5C5] rounded-2xl p-4">
                <div className="font-semibold text-[#01162A]">Aula de Capitalismo</div>
                <div className="text-[#01162A]/70 text-sm mt-1">17/06</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

