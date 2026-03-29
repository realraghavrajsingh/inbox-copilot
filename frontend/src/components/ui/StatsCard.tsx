'use client'

import { cn, formatNumber } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  suffix?: string
  trend?: number
  className?: string
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  suffix,
  trend,
  className,
}: StatsCardProps) {
  const formattedValue = typeof value === 'number' ? formatNumber(value) : value

  return (
    <div
      className={cn(
        'glass rounded-xl p-4 hover:bg-white/5 transition-all duration-200 group cursor-default',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400 group-hover:bg-primary-500/30 transition-colors">
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend >= 0
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {formattedValue}
        {suffix && <span className="text-lg font-normal text-gray-400 ml-1">{suffix}</span>}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}
