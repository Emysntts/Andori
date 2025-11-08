import Tabs from '@components/Tabs'
import StudentCard from '@components/StudentCard'

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
  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas', active: true },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <div className="space-y-6">
        {data.map((turma) => (
          <section key={turma.id} className="card p-5">
            <div className="text-lg font-semibold mb-4">{turma.nome}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {turma.alunos.map((a) => (
                <StudentCard key={a.id} id={a.id} name={a.nome} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

