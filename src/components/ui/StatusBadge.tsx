import { clsx } from 'clsx'
import type { StatusRAG } from '../../engine/types'

interface StatusBadgeProps {
  status: StatusRAG
  label?: string
}

const statusConfig = {
  aman: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Sehat' },
  perhatian: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Waspada' },
  bahaya: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Bahaya' },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.bg,
        config.text,
        config.border
      )}
    >
      {label ?? config.label}
    </span>
  )
}

export function StatusDot({ status }: { status: StatusRAG }) {
  return (
    <span
      className={clsx('inline-block w-3 h-3 rounded-full', {
        'bg-green-500': status === 'aman',
        'bg-yellow-500': status === 'perhatian',
        'bg-red-500': status === 'bahaya',
      })}
    />
  )
}
