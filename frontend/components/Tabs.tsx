'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'

type Tab = { href: string; label: string; active?: boolean }

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname()

  function isActive(tab: Tab) {
    if (typeof tab.active === 'boolean') return tab.active
    return pathname === tab.href
  }

  function colorClasses(label: string, active: boolean) {
    const name = label.toLowerCase()
    if (name.includes('turma')) {
      return clsx(
        'bg-[#EFB4C8] border-[#EFB4C8]',
        active && 'text-[#FFFEF1]',
        !active && 'text-[#FFFEF1] opacity-60'
      )
    }
    return clsx(
      'bg-[#6BAED6] border-[#6BAED6]',
      active && 'text-[#FFFEF1]',
      !active && 'text-[#FFFEF1] opacity-60'
    )
  }

  return (
    <div className="flex gap-0 mb-0">
      {tabs.map((t) => {
        const active = isActive(t)
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'px-14 py-4 -mb-px rounded-t-[2rem] border-2 font-bold text-xl capitalize min-w-[180px] text-center',
              'transition-colors',
              colorClasses(t.label, active),
              active ? 'relative z-10' : 'hover:opacity-100'
            )}
          >
            {t.label.charAt(0).toUpperCase() + t.label.slice(1)}
          </Link>
        )
      })}
    </div>
  )
}

