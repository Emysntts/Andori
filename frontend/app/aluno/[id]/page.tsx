'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Dot } from 'recharts'
import Tabs from '@components/Tabs'

type Props = { params: { id: string } }

// Opções de desempenho (mesmo do formulário)
const opcoesDesempenho = [
  { value: 'disperso', label: 'Disperso', color: '#EFB4C8' },
  { value: 'razoavel', label: 'Razoável', color: '#F4D35E' },
  { value: 'atento', label: 'Atento', color: '#6BAED6' },
  { value: 'focado', label: 'Focado', color: '#3B82C8' }
]

// Dados de exemplo das aulas com desempenho registrado
const aulas = [
  {
    id: '1',
    titulo: 'Aula de Capitalismo',
    data: '17/06',
    desempenho: ['atento', 'focado'], // múltipla escolha do formulário
    materialUtil: 'muito_util'
  },
  {
    id: '2',
    titulo: 'Aula de ?',
    data: '20/06',
    desempenho: ['razoavel'],
    materialUtil: 'util'
  },
  {
    id: '3',
    titulo: 'Aula de Economia',
    data: '24/06',
    desempenho: ['atento'],
    materialUtil: 'muito_util'
  },
  {
    id: '4',
    titulo: 'Aula de História',
    data: '27/06',
    desempenho: ['disperso', 'razoavel'],
    materialUtil: 'pouco_util'
  }
]

// Calcula estatísticas de desempenho
const calcularEstatisticas = () => {
  const contagem: Record<string, number> = {
    disperso: 0,
    razoavel: 0,
    atento: 0,
    focado: 0
  }
  
  aulas.forEach(aula => {
    aula.desempenho.forEach(d => {
      contagem[d] = (contagem[d] || 0) + 1
    })
  })
  
  return contagem
}

// Mapeia desempenho para valor numérico para o gráfico
const desempenhoParaValor = (desempenho: string[]): number => {
  const valores: Record<string, number> = {
    disperso: 1,
    razoavel: 2,
    atento: 3,
    focado: 4
  }
  
  // Usa a média se houver múltiplos desempenhos
  const soma = desempenho.reduce((acc, d) => acc + (valores[d] || 0), 0)
  return soma / desempenho.length
}

// Dados para o gráfico
const dadosGrafico = aulas.map(aula => ({
  data: aula.data,
  valor: desempenhoParaValor(aula.desempenho),
  desempenho: aula.desempenho
}))

// Mapeia material útil para exibição
const materialUtilLabel: Record<string, { label: string; color: string }> = {
  muito_util: { label: 'material muito bom', color: '#6BAED6' },
  util: { label: 'material regular', color: '#F4D35E' },
  pouco_util: { label: 'material ruim', color: '#EFB4C8' }
}

// Função para obter label do desempenho
const getDesempenhoLabel = (desempenhos: string[]): string => {
  if (desempenhos.length === 1) {
    return `aluno ${opcoesDesempenho.find(o => o.value === desempenhos[0])?.label.toLowerCase()}`
  }
  return `aluno ${desempenhos.map(d => opcoesDesempenho.find(o => o.value === d)?.label.toLowerCase()).join(' e ')}`
}

// Função para obter cor do desempenho (usa a primeira)
const getDesempenhoCor = (desempenhos: string[]): string => {
  return opcoesDesempenho.find(o => o.value === desempenhos[0])?.color || '#C5C5C5'
}

export default function AlunoPage({ params }: Props) {
  const router = useRouter()
  const alunoNome = `Aluno ${params.id}`
  const [descricao, setDescricao] = useState('')
  const [showDescricaoInput, setShowDescricaoInput] = useState(false)
  
  const estatisticas = calcularEstatisticas()

  return (
    <div>
      <Tabs
        tabs={[
          { href: '/', label: 'turmas' },
          { href: '/aulas', label: 'aulas' }
        ]}
      />

      <section className="panel rounded-tl-none p-8 -mt-px">
        <div className="space-y-6">
          {/* Info do Aluno */}
          <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
            <div className="flex items-start gap-5">
              <div className="w-32 h-32 rounded-full bg-[#C5C5C5] flex-shrink-0" />
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#01162A] mb-2">{alunoNome}</h1>
                <p className="text-[#01162A]/70 text-sm mb-4">infos dados pela família</p>
                
                {!showDescricaoInput && !descricao && (
                  <button
                    onClick={() => setShowDescricaoInput(true)}
                    className="px-6 py-2 rounded-xl border-2 border-[#EFB4C8] text-[#EFB4C8] font-semibold hover:bg-[#EFB4C8] hover:text-white transition-colors"
                  >
                    adicione a descrição
                  </button>
                )}
                
                {showDescricaoInput && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Digite a descrição do aluno..."
                      className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-2 focus:outline-none focus:border-[#EFB4C8] bg-transparent text-[#01162A] placeholder:text-[#C5C5C5]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDescricaoInput(false)}
                        className="px-4 py-2 rounded-xl border-2 border-[#C5C5C5] text-[#01162A] font-semibold hover:bg-[#C5C5C5]/20 transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setDescricao('')
                          setShowDescricaoInput(false)
                        }}
                        className="px-4 py-2 rounded-xl text-[#01162A]/60 font-semibold hover:text-[#01162A] transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                
                {descricao && !showDescricaoInput && (
                  <div className="flex items-start gap-3">
                    <p className="text-[#01162A] flex-1">{descricao}</p>
                    <button
                      onClick={() => setShowDescricaoInput(true)}
                      className="text-[#EFB4C8] font-semibold hover:text-[#EFB4C8]/80 transition-colors text-sm"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desempenho na disciplina */}
          <div>
            <h2 className="text-2xl font-bold text-[#01162A] mb-4">Desempenho na disciplina</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
                <div className="grid grid-cols-2 gap-4">
                  {opcoesDesempenho.map((opcao) => (
                    <div key={opcao.value} className="flex items-center gap-3">
                      <span
                        className="inline-block w-8 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opcao.color }}
                      />
                      <span className="font-medium text-[#01162A]">
                        {estatisticas[opcao.value]} {opcao.label.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#C5C5C5" />
                    <XAxis 
                      dataKey="data" 
                      stroke="#01162A"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      domain={[0.5, 4.5]}
                      ticks={[1, 2, 3, 4]}
                      tickFormatter={(value) => {
                        const labels = ['', 'Disperso', 'Razoável', 'Atento', 'Focado']
                        return labels[value] || ''
                      }}
                      stroke="#01162A"
                      style={{ fontSize: '11px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#3B82C8"
                      strokeWidth={3}
                      dot={(props: any) => {
                        const { cx, cy } = props
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill="#6BAED6"
                            stroke="#3B82C8"
                            strokeWidth={2}
                          />
                        )
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Aulas */}
          <div>
            <h2 className="text-2xl font-bold text-[#01162A] mb-4">Aulas</h2>
            <div className="space-y-4">
              {aulas.map((aula) => {
                const desempenhoLabel = getDesempenhoLabel(aula.desempenho)
                const desempenhoCor = getDesempenhoCor(aula.desempenho)
                const materialInfo = materialUtilLabel[aula.materialUtil]
                
                return (
                  <button
                    key={aula.id}
                    onClick={() => router.push(`/aulas/${aula.id}`)}
                    className="w-full border-2 border-[#C5C5C5] rounded-3xl p-6 bg-transparent hover:border-[#6BAED6] transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xl text-[#01162A] mb-1">
                          {aula.titulo}
                        </div>
                        <div className="text-[#01162A]/70">{aula.data}</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#01162A]/70">
                            {desempenhoLabel}
                          </span>
                          <span
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: desempenhoCor }}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#01162A]/70">
                            {materialInfo.label}
                          </span>
                          <span
                            className="w-6 h-6 rotate-45 rounded-sm"
                            style={{ backgroundColor: materialInfo.color }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

