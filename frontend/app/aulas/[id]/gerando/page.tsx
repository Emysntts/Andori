'use client'

import Tabs from '@components/Tabs'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GerandoMaterialPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const t = setTimeout(() => {
      const search = params.toString()
      router.replace(`./material?${search}`)
    }, 1800)
    return () => clearTimeout(t)
  }, [params, router])

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas', active: true }
        ]}
      />

      <div className="card p-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-brand-300 border-t-transparent animate-spin" />
          <div className="text-neutral-700">gerando conteúdo</div>
        </div>
      </div>
    </div>
  )
}


