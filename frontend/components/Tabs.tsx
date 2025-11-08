import Link from 'next/link'
import clsx from 'clsx'

type Tab = { href: string; label: string; active?: boolean }

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="flex gap-3 mb-4">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={clsx('tab', t.active && 'tab-active')}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}

