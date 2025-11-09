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
      className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-andori-paper border border-neutral-300 flex items-center justify-center">
          {/* Person icon (inline SVG) */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-andori-blue"
          >
            <path
              d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 20.25c0-3.175 2.825-5.75 6.312-5.75h3.376C17.175 14.5 20 17.075 20 20.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <div className="text-[#01162A] font-medium">{name}</div>
    </Link>
  )
}

