import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface PanelProps {
  children: ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const panelVariants = {
  default: 'bg-background',
  bordered: 'bg-background border border-border',
  elevated: 'bg-background shadow-md'
}

const panelSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'w-full'
}

export const Panel = ({
  children,
  variant = 'default',
  size = 'full',
  className
}: PanelProps) => {
  return (
    <div
      className={cn(
        'flex flex-col',
        panelVariants[variant],
        panelSizes[size],
        className
      )}
    >
      {children}
    </div>
  )
}

interface PanelHeaderProps {
  children: ReactNode
  className?: string
}

export const PanelHeader = ({ children, className }: PanelHeaderProps) => {
  return (
    <div
      className={cn(
        'flex-shrink-0 px-4 py-3 border-b border-border',
        className
      )}
    >
      {children}
    </div>
  )
}

interface PanelBodyProps {
  children: ReactNode
  scrollable?: boolean
  className?: string
}

export const PanelBody = ({
  children,
  scrollable = true,
  className
}: PanelBodyProps) => {
  return (
    <div
      className={cn(
        'flex-1 px-4 py-3',
        scrollable && 'overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

interface PanelFooterProps {
  children: ReactNode
  className?: string
}

export const PanelFooter = ({ children, className }: PanelFooterProps) => {
  return (
    <div
      className={cn(
        'flex-shrink-0 px-4 py-3 border-t border-border',
        className
      )}
    >
      {children}
    </div>
  )
}

interface PanelTitleProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

const titleLevels = {
  1: 'text-2xl font-bold',
  2: 'text-xl font-semibold',
  3: 'text-lg font-semibold',
  4: 'text-base font-semibold',
  5: 'text-sm font-semibold',
  6: 'text-xs font-semibold'
}

export const PanelTitle = ({
  children,
  level = 2,
  className
}: PanelTitleProps) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Tag className={cn(titleLevels[level], 'text-foreground', className)}>
      {children}
    </Tag>
  )
}
