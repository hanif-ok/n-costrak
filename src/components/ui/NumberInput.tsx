import { useState, useCallback } from 'react'
import { clsx } from 'clsx'

interface NumberInputProps {
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  suffix?: string
}

export function NumberInput({ value, onChange, placeholder = '0', className, disabled, suffix }: NumberInputProps) {
  const [text, setText] = useState(value !== null ? String(value) : '')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setText(raw)
      if (raw === '' || raw === '-') {
        onChange(null)
        return
      }
      const num = parseFloat(raw)
      if (!isNaN(num)) {
        onChange(Math.round(num * 100) / 100)
      }
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    if (value !== null) {
      setText(String(value))
    } else {
      setText('')
    }
  }, [value])

  return (
    <div className="relative">
      <input
        type="number"
        step="any"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          'w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-right',
          'focus:outline-none focus:ring-2 focus:ring-askrindo-light focus:border-askrindo-light',
          'disabled:bg-slate-100 disabled:text-slate-400',
          'placeholder:text-slate-400',
          suffix && 'pr-10',
          className
        )}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  )
}
