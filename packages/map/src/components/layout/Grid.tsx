import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface GridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12'
}

const gridGaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
}

export const Grid = ({
  children,
  cols = 1,
  gap = 'md',
  className
}: GridProps) => {
  return (
    <div className={cn('grid', gridCols[cols], gridGaps[gap], className)}>
      {children}
    </div>
  )
}

interface GridItemProps {
  children: ReactNode
  span?: 1 | 2 | 3 | 4 | 6 | 12 | 'full'
  className?: string
}

const gridSpan = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  6: 'col-span-6',
  12: 'col-span-12',
  full: 'col-span-full'
}

export const GridItem = ({ children, span = 1, className }: GridItemProps) => {
  return <div className={cn(gridSpan[span], className)}>{children}</div>
}
