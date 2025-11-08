import Link from 'next/link'

export default function StudentCard({
  id,
  name
}: {
  id: string | number
  name: string
}) {
  return (
    <Link
      href={`/aluno/${id}`}
      className="card p-3 flex items-center gap-3 hover:shadow transition"
    >
      <div className="w-10 h-10 rounded-full border" />
      <div className="text-neutral-800">{name}</div>
    </Link>
  )
}

