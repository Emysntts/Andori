'use client'

import * as React from 'react'
import Calendar from './ui/calendar'

type Props = {
  value?: string
  onChange?: (isoDate: string) => void
  placeholder?: string
}

function formatISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy'
}: Props) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const v = new Date(value)
    return Number.isNaN(v.getTime()) ? undefined : v
  }, [value])

  function handleSelect(date?: Date) {
    if (!date) return
    onChange?.(formatISO(date))
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full rounded-xl border-2 border-[#C5C5C5] px-4 py-3 bg-transparent text-left text-[#01162A] focus:outline-none focus:border-[#6BAED6] flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={selectedDate ? '' : 'text-[#C5C5C5]'}>
          {selectedDate ? formatDisplay(selectedDate) : placeholder}
        </span>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#6BAED6]">
          <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M7 2v4M17 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-2 rounded-2xl border-2 border-[#C5C5C5] bg-[#FFFEF1] shadow-lg"
          role="dialog"
          aria-modal="true"
        >
          <div className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              className="bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t-2 border-[#C5C5C5]">
            <button
              type="button"
              className="text-sm text-[#3B82C8] hover:underline"
              onClick={() => {
                onChange?.('')
                setOpen(false)
              }}
            >
              Limpar
            </button>
            <button
              type="button"
              className="text-sm text-[#3B82C8] hover:underline"
              onClick={() => {
                const now = new Date()
                onChange?.(formatISO(now))
                setOpen(false)
              }}
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


