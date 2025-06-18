// Breakpoint definitions matching Tailwind CSS defaults
export const breakpoints = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
} as const

export type Breakpoint = keyof typeof breakpoints

// Responsive utilities for conditional rendering/styling
export const responsive = {
  // Tailwind responsive classes for show/hide
  show: {
    mobile: 'block md:hidden',
    tablet: 'hidden md:block lg:hidden',
    desktop: 'hidden lg:block'
  },
  hide: {
    mobile: 'hidden md:block',
    tablet: 'block md:hidden lg:block',
    desktop: 'block lg:hidden'
  }
} as const

// Responsive spacing utilities
export const spacing = {
  responsive: {
    padding: {
      x: 'px-4 md:px-6 lg:px-8',
      y: 'py-4 md:py-6 lg:py-8',
      all: 'p-4 md:p-6 lg:p-8'
    },
    margin: {
      x: 'mx-4 md:mx-6 lg:mx-8',
      y: 'my-4 md:my-6 lg:my-8',
      all: 'm-4 md:m-6 lg:m-8'
    },
    gap: {
      sm: 'gap-2 md:gap-3 lg:gap-4',
      md: 'gap-4 md:gap-6 lg:gap-8',
      lg: 'gap-6 md:gap-8 lg:gap-10'
    }
  }
} as const

// Container responsive classes
export const containers = {
  responsive: {
    width: 'w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl',
    fullWidth: 'w-full',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
  }
} as const

// Typography responsive utilities
export const typography = {
  responsive: {
    heading: {
      h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
      h2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
      h3: 'text-lg md:text-xl lg:text-2xl font-semibold',
      h4: 'text-base md:text-lg lg:text-xl font-semibold'
    },
    body: {
      sm: 'text-sm md:text-base',
      md: 'text-base md:text-lg',
      lg: 'text-lg md:text-xl'
    }
  }
} as const

// Grid responsive utilities
export const grid = {
  responsive: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 md:grid-cols-2',
    cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }
} as const

// Touch-friendly sizing (minimum 44px touch targets)
export const touch = {
  button: 'min-h-[44px] min-w-[44px]',
  input: 'min-h-[44px]',
  clickable: 'min-h-[44px] min-w-[44px]'
} as const
