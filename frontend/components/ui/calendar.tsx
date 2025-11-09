import * as React from 'react'
import { DayPicker } from 'react-day-picker'

type CalendarProps = React.ComponentProps<typeof DayPicker>

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ')
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cx('p-3', className)}
      classNames={{
        months:
          'flex flex-col sm:flex-row gap-6 sm:gap-4',
        month:
          'space-y-4',
        caption:
          'relative flex items-center justify-center px-1',
        caption_label:
          'text-sm font-semibold text-[#3B82C8] capitalize',
        nav: 'absolute right-1 top-1 flex items-center gap-1',
        nav_button:
          'inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#3B82C8]/10 text-[#3B82C8] transition-colors',
        nav_button_previous: 'relative',
        nav_button_next: 'relative',
        table: 'w-full border-collapse space-y-1',
        head_row: 'grid grid-cols-7',
        head_cell:
          'text-[#3B82C8]/70 font-medium text-[11px] h-8 w-8',
        row: 'grid grid-cols-7 gap-2',
        cell:
          'h-9 w-9 text-center text-sm relative focus-within:relative focus-within:z-20',
        day: cx(
          'h-9 w-9 rounded-lg font-medium text-[#01162A]',
          'hover:bg-[#3B82C8]/10 transition-colors'
        ),
        day_selected:
          'bg-[#6BAED6] text-white hover:bg-[#6BAED6] hover:text-white focus:bg-[#6BAED6]',
        day_today:
          'bg-[#6BAED6]/20 text-[#3B82C8] font-bold',
        day_outside:
          'text-[#01162A]/30 opacity-60',
        day_disabled:
          'text-[#01162A]/30 opacity-50 cursor-not-allowed',
        day_range_middle:
          'aria-selected:bg-[#6BAED6]/30 aria-selected:text-[#01162A]',
        day_hidden: 'invisible',
        ...classNames
      }}
      components={{
        IconLeft: () => (
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M12.5 5l-5 5 5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        IconRight: () => (
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M7.5 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      }}
      {...props}
    />
  )
}

export default Calendar


