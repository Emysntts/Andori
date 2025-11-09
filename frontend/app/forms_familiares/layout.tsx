import '../globals.css'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function FormsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={poppins.className}>
        <header className="py-8">
          <div className="container-page flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/Frame%201%201.png"
                alt="Andori"
                width={200}
                height={60}
                priority
              />
            </div>
            <div />
          </div>
        </header>
        <main className="container-page pb-10">{children}</main>
      </body>
    </html>
  )
}


