'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'
import { Link as RouterLink } from 'react-router'

interface LinkProps extends React.ComponentProps<typeof RouterLink> {
  className?: string
}

function Link(props: LinkProps) {
  const { className, ...rest } = props
  return (
    <RouterLink
      className={cn(
        'text-sm text-primary transition-colors hover:text-primary/90 font-bold',
        className
      )}
      {...rest}
    />
  )
}

export { Link }
