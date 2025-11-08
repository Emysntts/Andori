type Props = { params: { id: string } }

const performance = [
  { label: 'focado', color: 'bg-emerald-500', value: 6 },
  { label: 'razoável', color: 'bg-amber-400', value: 3 },
  { label: 'razoável', color: 'bg-sky-400', value: 3 },
  { label: 'disperso', color: 'bg-rose-400', value: 5 }
]

export default function AlunoPage({ params }: Props) {
  const alunoNome = `Aluno ${params.id}`
  return (
    <div className="space-y-6">
      <section className="card p-5 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full border" />
        <div className="text-2xl font-semibold">{alunoNome}</div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 md:col-span-2">
          <div className="text-lg font-semibold mb-4">Desempenho</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4 space-y-3">
              {performance.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${p.color}`} />
                  <span className="text-sm text-neutral-700">{p.value} {p.label}</span>
                </div>
              ))}
            </div>
            <div className="card p-4 flex items-center justify-center text-neutral-500">
              gráfico
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-lg font-semibold mb-4">Aulas e Relatórios</div>
          <div className="card p-3">
            <div className="font-medium">Aula de Capitalismo</div>
            <div className="text-neutral-500 text-sm">17/06</div>
          </div>
        </div>
      </section>
    </div>
  )
}

