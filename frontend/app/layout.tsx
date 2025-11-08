import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Andori',
  description: 'MVP Andori'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b bg-white">
          <div className="container-page py-4 flex items-center justify-between">
            <div className="text-2xl font-semibold">Andori</div>
            <div className="flex items-center gap-3">
              <input
                placeholder="Buscar..."
                className="hidden md:block w-72 border rounded-lg px-3 py-2 text-sm"
              />
              <div className="text-sm text-neutral-600">
                Edson <span className="text-neutral-400">• professor de geografia</span>
              </div>
              <div className="w-8 h-8 rounded-full border" />
            </div>
          </div>
        </header>
        <main className="container-page py-6">{children}</main>
      </body>
    </html>
  )
}

