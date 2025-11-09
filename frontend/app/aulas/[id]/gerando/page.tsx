'use client'

import Tabs from '@components/Tabs'
import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { generateLessonMaterial } from '@features/lesson-generation/agent'

export default function GerandoMaterialPage() {
  const router = useRouter()
  const params = useSearchParams()
  const route = useParams<{ id: string }>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const id = route?.id
      
      // Limpar qualquer material existente antes de gerar novo
      if (id) {
        sessionStorage.removeItem(`material:${id}`)
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      const payload = {
        assunto: params.get('assunto') || '',
        descricao: params.get('descricao') || '',
        turma: params.get('turma') || '',
        data: params.get('data') || '',
        feedback: params.get('feedback') || undefined,
        hyperfocus: 'Minecraft'
      }
      try {
        let material: any = null
        if (API_BASE) {
          const endpoint = `${API_BASE}/api/v1/material/generate`
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (resp.ok) {
            const json = await resp.json()
            material = json?.material
          }
        }
        if (!material) material = generateLessonMaterial(payload)
        // Normalize fields to strings in case the model returns structured objects
        const toText = (v: unknown): string => {
          if (typeof v === 'string') return v
          if (Array.isArray(v)) return v.map((x) => toText(x)).join('\n')
          if (v && typeof v === 'object') {
            try {
              return Object.entries(v as Record<string, unknown>)
                .map(([k, val]) => `${k.split('_').join(' ')}: ${toText(val)}`)
                .join('\n')
            } catch {
              return JSON.stringify(v)
            }
          }
          return String(v ?? '')
        }
        material.recomendacoes = toText(material.recomendacoes)
        material.roteiro = toText(material.roteiro)
        material.resumo = toText(material.resumo)
        if (id) {
          sessionStorage.setItem(`material:${id}`, JSON.stringify(material))
          router.replace(`/aulas/${id}/material`)
        } else {
          router.replace('./material')
        }
      } catch (e) {
        const id = route?.id
        const material = generateLessonMaterial(payload)
        if (id) {
          sessionStorage.setItem(`material:${id}`, JSON.stringify(material))
          router.replace(`/aulas/${id}/material`)
        } else {
          router.replace('./material')
        }
      }
    }
    run()
  }, [params, route, router])

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <section className="panel-blue rounded-tl-none p-8 -mt-px">
        <div className="border-2 border-[#6BAED6] rounded-3xl p-12 bg-transparent flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full border-4 border-[#6BAED6] border-t-transparent animate-spin" />
            <div className="text-xl font-semibold text-[#01162A]">
              {error ? 'Erro ao gerar' : 'Gerando conteúdo...'}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


