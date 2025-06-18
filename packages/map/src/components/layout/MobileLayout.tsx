import { ReactNode, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { Panel, PanelBody } from './Panel'
import { touch } from './responsive'

interface MobileLayoutProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
  mode?: 'overlay' | 'bottom-sheet' | 'full-screen'
  className?: string
}

export const MobileLayout = ({
  leftPanel,
  rightPanel,
  mode = 'overlay',
  className
}: MobileLayoutProps) => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)

  // Handle touch events for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStart) return

    const currentX = e.touches[0].clientX
    const deltaX = currentX - dragStart

    // Swipe right to open (from left edge)
    if (deltaX > 50 && dragStart < 20) {
      setIsLeftPanelOpen(true)
      setDragStart(null)
    }
    // Swipe left to close
    else if (deltaX < -50 && isLeftPanelOpen) {
      setIsLeftPanelOpen(false)
      setDragStart(null)
    }
  }

  const handleTouchEnd = () => {
    setDragStart(null)
  }

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isLeftPanelOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isLeftPanelOpen])

  const renderOverlayMode = () => (
    <>
      {/* Main content - Map */}
      <div className='flex-1 relative'>
        {rightPanel}

        {/* Mobile menu button */}
        <button
          onClick={() => setIsLeftPanelOpen(true)}
          className={cn(
            'absolute top-4 left-4 z-40 p-3 bg-background border border-border rounded-lg shadow-lg',
            touch.button
          )}
          aria-label='Open menu'
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
      </div>

      {/* Overlay panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-5/6 max-w-sm transition-transform duration-300',
          isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Panel variant='elevated' className='h-full'>
          <PanelBody scrollable className='p-0'>
            {leftPanel}
          </PanelBody>
        </Panel>
      </div>

      {/* Backdrop */}
      {isLeftPanelOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={() => setIsLeftPanelOpen(false)}
        />
      )}
    </>
  )

  const renderBottomSheetMode = () => (
    <>
      {/* Main content - Map */}
      <div className='flex-1 relative'>
        {rightPanel}

        {/* Bottom sheet toggle */}
        <button
          onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          className={cn(
            'absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40',
            'px-6 py-3 bg-background border border-border rounded-full shadow-lg',
            touch.button
          )}
          aria-label='Toggle list'
        >
          <svg
            className={cn(
              'w-6 h-6 transition-transform duration-200',
              isLeftPanelOpen && 'rotate-180'
            )}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 15l7-7 7 7'
            />
          </svg>
        </button>
      </div>

      {/* Bottom sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 rounded-t-lg',
          isLeftPanelOpen ? 'translate-y-0' : 'translate-y-full',
          'h-3/4' // Take up 75% of screen height
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Panel variant='elevated' className='h-full rounded-t-lg'>
          {/* Drag handle */}
          <div className='flex justify-center p-2 border-b border-border'>
            <div className='w-12 h-1 bg-muted-foreground rounded-full' />
          </div>

          <PanelBody scrollable className='p-0'>
            {leftPanel}
          </PanelBody>
        </Panel>
      </div>
    </>
  )

  const renderFullScreenMode = () => (
    <>
      {isLeftPanelOpen ? (
        /* Full screen panel view */
        <Panel className='flex-1'>
          <div className='flex items-center justify-between p-4 border-b border-border'>
            <button
              onClick={() => setIsLeftPanelOpen(false)}
              className={cn('p-2 rounded-lg hover:bg-muted', touch.button)}
              aria-label='Back to map'
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
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </button>
          </div>

          <PanelBody scrollable className='p-0'>
            {leftPanel}
          </PanelBody>
        </Panel>
      ) : (
        /* Map view */
        <div className='flex-1 relative'>
          {rightPanel}

          <button
            onClick={() => setIsLeftPanelOpen(true)}
            className={cn(
              'absolute top-4 left-4 z-40 p-3 bg-background border border-border rounded-lg shadow-lg',
              touch.button
            )}
            aria-label='Show list'
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
        </div>
      )}
    </>
  )

  return (
    <div
      className={cn('h-screen flex flex-col overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {mode === 'overlay' && renderOverlayMode()}
      {mode === 'bottom-sheet' && renderBottomSheetMode()}
      {mode === 'full-screen' && renderFullScreenMode()}
    </div>
  )
}
