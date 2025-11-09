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

export default function Calendar({
  value,
  onChange
}: {
  value?: Date | null
  onChange?: (date: Date) => void
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
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-3 select-none">
      <div className="flex items-center justify-between px-1 py-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-md hover:bg-neutral-100"
          aria-label="mês anterior"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <path d="M12.5 5l-5 5 5 5" stroke="#01162A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-sm font-medium text-[#01162A] capitalize">{monthLabel}</div>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-md hover:bg-neutral-100"
          aria-label="próximo mês"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <path d="M7.5 5l5 5-5 5" stroke="#01162A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-neutral-500 px-1">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
          <div key={d} className="h-7 flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1 px-1">
        {monthMatrix.flatMap((week, i) =>
          week.map((date, j) => {
            const isToday =
              !!date &&
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            const label = date ? date.getDate() : ''
            return (
              <button
                key={`${i}-${j}`}
                disabled={!date}
                onClick={() => date && onChange?.(date)}
                className={`h-8 rounded-md text-sm flex items-center justify-center ${
                  isToday ? 'bg-andori-sky/20 text-andori-blue' : 'text-[#01162A]'
                } ${!date ? 'opacity-0 cursor-default' : 'hover:bg-neutral-100'}`}
              >
                {label}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}


