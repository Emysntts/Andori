import Tabs from '@components/Tabs'

const aulas = [
  { id: 'a1', titulo: 'Aula de Capitalismo', data: '17/06' },
  { id: 'a2', titulo: 'Aula de História do Brasil', data: '20/06' }
]

export default function AulasPage() {
  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas', active: true }
        ]}
      />

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="text-lg font-semibold">Aulas</div>
          <button className="px-3 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50">
            add aula
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 card h-64 flex items-center justify-center text-neutral-500">
            calendário
          </div>
          <div className="md:col-span-2 space-y-4">
            {aulas.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="font-medium">{a.titulo}</div>
                <div className="text-neutral-500 text-sm">{a.data}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

