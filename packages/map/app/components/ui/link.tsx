'use client'

import * as React from 'react'
import { Link as RouterLink } from 'react-router'

import { cn } from '~/lib/utils'

interface LinkProps extends React.ComponentProps<typeof RouterLink> {
  className?: string
}

function Link(props: LinkProps) {
  const { className, ...rest } = props
  return (
    <RouterLink
      className={cn(
        'font-primary text-base font-bold text-primary/90 leading-relaxed underline underline-offset-4 hover:text-primary/80 transition-colors subpixel-antialiased',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2',
        className
      )}
      {...rest}
    />
  )
}

export { Link }
