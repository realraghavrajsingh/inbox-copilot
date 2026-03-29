'use client'

import { cn, getScoreColor } from '@/lib/utils'

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
}

export default function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = true,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference
  const color = getScoreColor(value)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{value}</span>
          {label && <span className="text-xs text-gray-400 mt-1">{label}</span>}
        </div>
      )}
    </div>
  )
}
