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
    if (name.includes('aula')) {
      return clsx(
        'bg-rose-300 text-rose-900 border-rose-400',
        active && 'bg-rose-400 text-white'
      )
    }
    return clsx(
      'bg-[#2A56A4] text-white border-[#234A8C]',
      active && 'bg-[#254E93] text-white'
    )
  }

  return (
    <div className="flex gap-2 mb-0 border-b border-neutral-200">
      {tabs.map((t) => {
        const active = isActive(t)
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'px-6 py-2 -mb-px rounded-t-2xl border',
              'transition-colors',
              colorClasses(t.label, active),
              active ? 'relative z-10' : 'opacity-90 hover:opacity-100'
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}

