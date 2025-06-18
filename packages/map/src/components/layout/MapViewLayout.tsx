import { ReactNode, useState } from 'react'
import { cn } from '../../lib/utils'
import { Panel, PanelBody } from './Panel'

interface MapViewLayoutProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
  leftPanelWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const leftPanelWidths = {
  sm: 'w-80', // 320px
  md: 'w-96', // 384px
  lg: 'w-[28rem]', // 448px
  xl: 'w-[32rem]' // 512px
}

export const MapViewLayout = ({
  leftPanel,
  rightPanel,
  leftPanelWidth = 'lg',
  className
}: MapViewLayoutProps) => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)

  return (
    <div className={cn('h-screen flex overflow-hidden', className)}>
      {/* Left Panel - List/Detail View */}
      <Panel
        variant='bordered'
        className={cn(
          'flex-shrink-0 transition-all duration-300',
          leftPanelWidths[leftPanelWidth],
          // Mobile: overlay/slide behavior
          'fixed inset-y-0 left-0 z-40 md:relative md:z-auto',
          isLeftPanelOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0',
          // On mobile, show/hide with transform
          'md:flex',
          !isLeftPanelOpen && 'md:w-0 md:min-w-0 md:border-0'
        )}
      >
        <PanelBody scrollable className='p-0'>
          {leftPanel}
        </PanelBody>
      </Panel>

      {/* Mobile backdrop */}
      {isLeftPanelOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden'
          onClick={() => setIsLeftPanelOpen(false)}
        />
      )}

      {/* Right Panel - Map View */}
      <Panel className='flex-1 relative'>
        <PanelBody scrollable={false} className='p-0 relative'>
          {/* Mobile toggle button */}
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className={cn(
              'absolute top-4 left-4 z-50 p-2 bg-background border border-border rounded-md shadow-md',
              'md:hidden' // Hide on desktop
            )}
            aria-label='Toggle panel'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>

          {/* Desktop toggle button */}
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className={cn(
              'absolute top-4 left-4 z-50 p-2 bg-background border border-border rounded-md shadow-md',
              'hidden md:block' // Show only on desktop
            )}
            aria-label='Toggle panel'
          >
            <svg
              className={cn(
                'w-6 h-6 transition-transform duration-200',
                !isLeftPanelOpen && 'rotate-180'
              )}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>

          {rightPanel}
        </PanelBody>
      </Panel>
    </div>
  )
}

// Responsive breakpoint hook for layout decisions
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  )

  // This would typically use a proper responsive hook
  // For now, we'll use CSS classes for responsive behavior
  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  }
}
