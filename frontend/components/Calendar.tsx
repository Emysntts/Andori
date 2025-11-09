'use client'

import { useMemo, useState } from 'react'

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay() // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const matrix: Array<Array<Date | null>> = []
  let currentDay = 1 - startWeekday
  for (let week = 0; week < 6; week++) {
    const row: Array<Date | null> = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(year, month, currentDay)
      if (currentDay < 1 || currentDay > daysInMonth) {
        row.push(null)
      } else {
        row.push(date)
      }
      currentDay++
    }
    matrix.push(row)
  }
  return matrix
}

type Aula = { id: string; titulo: string; data: string }

export default function Calendar({
  value,
  onChange,
  aulas = []
}: {
  value?: Date | null
  onChange?: (date: Date) => void
  aulas?: Aula[]
}) {
  const today = new Date()
  const [view, setView] = useState({
    year: (value ?? today).getFullYear(),
    month: (value ?? today).getMonth()
  })

  const monthMatrix = useMemo(
    () => getMonthMatrix(view.year, view.month),
    [view.month, view.year]
  )

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(
    'pt-BR',
    { month: 'long', year: 'numeric' }
  )

  // Criar um Set de datas com aulas para busca rápida
  const aulaDates = useMemo(() => {
    const dates = new Set<string>()
    aulas.forEach((aula) => {
      if (!aula?.data) return

      const raw = aula.data.trim()
      let parsed: Date | null = null

      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        // ISO 8601 (yyyy-mm-dd)
        parsed = new Date(raw)
      } else if (/^\d{2}\/\d{2}(\/\d{2,4})?$/.test(raw)) {
        // Formato brasileiro dd/mm[/yyyy]
        const [dayStr, monthStr, yearStr] = raw.split('/')
        const day = Number(dayStr)
        const month = Number(monthStr) - 1
        const year = yearStr ? Number(yearStr.length === 2 ? `20${yearStr}` : yearStr) : new Date().getFullYear()
        parsed = new Date(year, month, day)
      } else {
        // Tenta parsear com Date nativo
        const fallback = new Date(raw)
        parsed = Number.isNaN(fallback.getTime()) ? null : fallback
      }

      if (parsed && !Number.isNaN(parsed.getTime())) {
        const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
        dates.add(key)
      }
    })
    return dates
  }, [aulas])

  function hasAula(date: Date | null): boolean {
    if (!date) return false
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return aulaDates.has(dateStr)
  }

  function prevMonth() {
    setView((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }
    )
  }
  function nextMonth() {
    setView((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }
    )
  }

  return (
    <div className="border-2 border-[#C5C5C5] rounded-3xl p-5 select-none bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-[#3B82C8]/10 transition-colors"
          aria-label="mês anterior"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <path d="M12.5 5l-5 5 5 5" stroke="#3B82C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-base font-semibold text-[#3B82C8] capitalize">{monthLabel}</div>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-[#3B82C8]/10 transition-colors"
          aria-label="próximo mês"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <path d="M7.5 5l5 5-5 5" stroke="#3B82C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs font-medium text-[#3B82C8]/70 mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
          <div key={`${d}-${idx}`} className="h-8 flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthMatrix.flatMap((week, i) =>
          week.map((date, j) => {
            const isToday =
              !!date &&
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            const isSelected = 
              value && date &&
              date.getDate() === value.getDate() &&
              date.getMonth() === value.getMonth() &&
              date.getFullYear() === value.getFullYear()
            const dateHasAula = hasAula(date)
            const label = date ? date.getDate() : ''
            return (
              <button
                key={`${i}-${j}`}
                disabled={!date}
                onClick={() => date && onChange?.(date)}
                className={`h-9 rounded-lg text-sm font-medium flex flex-col items-center justify-center transition-all relative
                  ${isSelected ? 'bg-[#3B82C8] text-white' : ''}
                  ${isToday && !isSelected ? 'bg-[#6BAED6]/20 text-[#3B82C8] font-bold' : ''}
                  ${!isToday && !isSelected && date ? 'text-[#01162A] hover:bg-[#3B82C8]/10' : ''}
                  ${!date ? 'opacity-0 cursor-default' : 'cursor-pointer'}
                `}
              >
                {label}
                {dateHasAula && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#6BAED6]" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}


