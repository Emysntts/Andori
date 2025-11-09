import Image from 'next/image'
import Link from 'next/link'

import { selectTurmaAvatar } from '@lib/avatar'

export default function StudentCard({
  id,
  name,
  avatarUrl,
  order
}: {
  id: string | number
  name: string
  avatarUrl?: string | null
  order?: number
}) {
  const fallbackKey = order ?? id
  const fallbackAvatar = selectTurmaAvatar(fallbackKey)
  const resolvedAvatar = avatarUrl ?? fallbackAvatar

  return (
    <Link
      href={`/aluno/${id}`}
      className="bg-transparent border-2 border-[#C5C5C5] rounded-2xl px-5 py-4 flex items-center gap-4 transition-colors hover:border-[#3B82C8]"
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={resolvedAvatar}
          alt={`Foto de ${name}`}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="text-[#01162A] font-medium text-lg">{name}</div>
    </Link>
  )
}

