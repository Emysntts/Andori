import Link from 'next/link'

export default function StudentCard({
  id,
  name,
  avatarUrl
}: {
  id: string | number
  name: string
  avatarUrl?: string | null
}) {
  return (
    <Link
      href={`/aluno/${id}`}
      className="bg-transparent border-2 border-[#C5C5C5] rounded-2xl px-5 py-4 flex items-center gap-4 transition-colors hover:border-[#3B82C8]"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-[#C5C5C5] flex-shrink-0" />
      )}
      <div className="text-[#01162A] font-medium text-lg">{name}</div>
    </Link>
  )
}

