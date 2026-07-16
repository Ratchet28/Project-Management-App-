import type { CSSProperties } from 'react'

interface IconProps {
  style?: CSSProperties
  className?: string
}

export function LogoIcon({ style, className = 'icon' }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth={1.5}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

export function PlusIcon({ style, className = 'icon' }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function SearchIcon({ style, className = 'icon' }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function ChevronIcon({ style, className = 'icon' }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function CheckIcon({ style, className = 'icon' }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth={2}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function CloseIcon({ style, className = 'icon' }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
