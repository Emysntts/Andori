import './globals.css'
import type { ReactNode } from 'react'
import Image from 'next/image'

export const metadata = {
  title: 'Andori',
  description: 'MVP Andori'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-brand-50">
        <header className="py-6">
          <div className="container-page flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/Frame%201%201.png"
                alt="Andori"
                width={180}
                height={48}
                priority
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-neutral-900 font-semibold">Edson</div>
                <div className="text-neutral-600 text-sm">Professor</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-300" />
            </div>
          </div>
        </header>
        <main className="container-page pb-10">{children}</main>
      </body>
    </html>
  )
}

