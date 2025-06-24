import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FixedSizeList as List } from 'react-window'
import { Feature, FeatureCollection } from '../../types/types'
import { Button } from '../ui/button'
import { ListItemCard } from './ListItemCard'

interface ListViewProps {
  data: FeatureCollection | undefined
  isLoading?: boolean
  error?: Error | null
  selectedItemId?: string
  onItemSelect?: (feature: Feature) => void
  onItemClick?: (feature: Feature) => void
  className?: string
  showLoadMore?: boolean
  onLoadMore?: () => void
  isLoadingMore?: boolean
  totalCount?: number
  itemHeight?: number
  height?: number | string
}

interface ListItemProps {
  index: number
  style: React.CSSProperties
  data: {
    features: Feature[]
    selectedItemId?: string
    onItemClick?: (feature: Feature) => void
  }
}

// Virtualized list item renderer
const ListItem: React.FC<ListItemProps> = ({ index, style, data }) => {
  const { features, selectedItemId, onItemClick } = data
  const feature = features[index]

  if (!feature) return null

  const isSelected = selectedItemId === feature.properties.id

  return (
    <div style={style} className='px-2 py-1 fade-in'>
      <ListItemCard
        feature={feature}
        onClick={onItemClick}
        isSelected={isSelected}
        className='list-item-card'
      />
    </div>
  )
}

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <div className='space-y-3 p-2'>
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className='bg-muted rounded-lg p-4 space-y-3 loading-shimmer'
      >
        <div className='flex items-start justify-between'>
          <div className='space-y-2 flex-1'>
            <div className='h-4 bg-muted-foreground/20 rounded w-3/4' />
            <div className='h-3 bg-muted-foreground/20 rounded w-1/2' />
          </div>
          <div className='h-6 w-16 bg-muted-foreground/20 rounded' />
        </div>
        <div className='space-y-2'>
          <div className='h-3 bg-muted-foreground/20 rounded w-full' />
          <div className='h-3 bg-muted-foreground/20 rounded w-2/3' />
        </div>
        <div className='flex gap-1'>
          <div className='h-5 w-12 bg-muted-foreground/20 rounded' />
          <div className='h-5 w-16 bg-muted-foreground/20 rounded' />
          <div className='h-5 w-14 bg-muted-foreground/20 rounded' />
        </div>
      </div>
    ))}
  </div>
)

// Empty state component
const EmptyState: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center fade-in'>
      <div className='text-6xl mb-4'>🌱</div>
      <h3 className='text-lg font-semibold mb-2'>
        {t('map.list.empty.title', 'No places found')}
      </h3>
      <p className='text-muted-foreground text-sm max-w-sm'>
        {message ||
          t(
            'map.list.empty.description',
            'Try adjusting your search or filters to find more places in your area.'
          )}
      </p>
    </div>
  )
}

// Error state component
const ErrorState: React.FC<{ error: Error; onRetry?: () => void }> = ({
  error,
  onRetry
}) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center fade-in'>
      <div className='text-6xl mb-4'>⚠️</div>
      <h3 className='text-lg font-semibold mb-2'>
        {t('map.list.error.title', 'Something went wrong')}
      </h3>
      <p className='text-muted-foreground text-sm max-w-sm mb-4'>
        {error.message ||
          t(
            'map.list.error.description',
            "We couldn't load the places. Please try again."
          )}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant='outline' size='sm'>
          {t('map.list.error.retry', 'Try again')}
        </Button>
      )}
    </div>
  )
}

export const ListView: React.FC<ListViewProps> = ({
  data,
  isLoading = false,
  error = null,
  selectedItemId,
  onItemSelect,
  onItemClick,
  className = '',
  showLoadMore = false,
  onLoadMore,
  isLoadingMore = false,
  totalCount,
  itemHeight = 280, // Estimated height of ListItemCard
  height = '100%'
}) => {
  const { t } = useTranslation()
  const [retryKey, setRetryKey] = useState(0)

  const features = useMemo(() => {
    return data?.features || []
  }, [data])

  const handleItemClick = useCallback(
    (feature: Feature) => {
      // Call both handlers if provided
      onItemSelect?.(feature)
      onItemClick?.(feature)
    },
    [onItemSelect, onItemClick]
  )

  const handleRetry = useCallback(() => {
    setRetryKey((prev) => prev + 1)
    // Trigger a refetch if there's a retry mechanism
  }, [])

  const itemData = useMemo(
    () => ({
      features,
      selectedItemId,
      onItemClick: handleItemClick
    }),
    [features, selectedItemId, handleItemClick]
  )

  // Show loading state
  if (isLoading) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={className}>
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    )
  }

  // Show empty state
  if (!features.length) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    )
  }

  const listHeight =
    typeof height === 'string'
      ? height === '100%'
        ? window.innerHeight - 200 // Adjust based on layout
        : parseInt(height)
      : height

  return (
    <div className={`${className} optimized-list`}>
      {/* List Header */}
      <div className='px-2 py-2 border-b fade-in'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>
            {t('map.list.showing', 'Showing {{count}} places', {
              count: features.length
            })}
            {totalCount && totalCount > features.length && (
              <span className='text-muted-foreground'> of {totalCount}</span>
            )}
          </span>
        </div>
      </div>

      {/* Virtualized List */}
      <div className='flex-1 overflow-hidden custom-scrollbar smooth-scroll'>
        <List
          height={listHeight}
          width='100%'
          itemCount={features.length}
          itemSize={itemHeight}
          itemData={itemData}
          overscanCount={5} // Render extra items for smooth scrolling
          className='optimized-list'
        >
          {ListItem}
        </List>
      </div>

      {/* Load More Button */}
      {showLoadMore && onLoadMore && (
        <div className='p-4 border-t fade-in'>
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant='outline'
            className='w-full'
          >
            {isLoadingMore
              ? t('map.list.loadingMore', 'Loading more...')
              : t('map.list.loadMore', 'Load more places')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ListView
