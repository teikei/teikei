import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface FlexProps {
  children: ReactNode
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const flexDirection = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse'
}

const alignItems = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline'
}

const justifyContent = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
}

const flexWrap = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse'
}

const flexGaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
}

export const Flex = ({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = 'nowrap',
  gap = 'md',
  className
}: FlexProps) => {
  return (
    <div
      className={cn(
        'flex',
        flexDirection[direction],
        alignItems[align],
        justifyContent[justify],
        flexWrap[wrap],
        flexGaps[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

interface FlexItemProps {
  children: ReactNode
  grow?: boolean
  shrink?: boolean
  basis?: 'auto' | 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4'
  className?: string
}

const flexBasis = {
  auto: 'basis-auto',
  full: 'basis-full',
  '1/2': 'basis-1/2',
  '1/3': 'basis-1/3',
  '2/3': 'basis-2/3',
  '1/4': 'basis-1/4',
  '3/4': 'basis-3/4'
}

export const FlexItem = ({
  children,
  grow = false,
  shrink = true,
  basis = 'auto',
  className
}: FlexItemProps) => {
  return (
    <div
      className={cn(
        grow && 'flex-grow',
        !shrink && 'flex-shrink-0',
        flexBasis[basis],
        className
      )}
    >
      {children}
    </div>
  )
}
