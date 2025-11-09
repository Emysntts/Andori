import './globals.css'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Andori',
  description: 'MVP Andori'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const professorAvatar = '/perfil1.png'

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
            <div className="flex items-center gap-3 bg-[#B8D9F0] rounded-2xl px-6 py-3">
              <div className="text-left">
                <div className="text-[#01162A] font-bold text-lg">Juliana</div>
                <div className="text-[#01162A] text-sm">Professora</div>
              </div>
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={professorAvatar}
                  alt="Foto do professor Edson"
                  fill
                  sizes="56px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </header>
        <main className="container-page pb-10">{children}</main>
      </body>
    </html>
  )
}

