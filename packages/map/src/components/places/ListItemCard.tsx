import React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { Feature, FeatureType } from '../../types/types'
import { Badge } from '../ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card'

interface ListItemCardProps {
  feature: Feature
  onClick?: (feature: Feature) => void
  isSelected?: boolean
  className?: string
}

const getTypeColor = (type: FeatureType): string => {
  switch (type) {
    case 'Farm':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'Depot':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'Initiative':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeIcon = (type: FeatureType): string => {
  switch (type) {
    case 'Farm':
      return '🚜'
    case 'Depot':
      return '📦'
    case 'Initiative':
      return '🤝'
    default:
      return '📍'
  }
}

export const ListItemCard: React.FC<ListItemCardProps> = ({
  feature,
  onClick,
  isSelected = false,
  className
}) => {
  const { t } = useTranslation()
  const { properties } = feature

  const handleClick = () => {
    if (onClick) {
      onClick(feature)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'ring-2 ring-primary shadow-lg',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='button'
      aria-label={`${properties.name} - ${properties.type} in ${properties.city}`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-base font-semibold leading-tight truncate'>
              {properties.name}
            </CardTitle>
            <CardDescription className='text-sm text-muted-foreground mt-1'>
              {properties.city}
              {properties.postalcode && ` • ${properties.postalcode}`}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2 ml-3'>
            <span className='text-lg' aria-hidden='true'>
              {getTypeIcon(properties.type)}
            </span>
            <Badge
              variant='outline'
              className={cn('text-xs', getTypeColor(properties.type))}
            >
              {t(`map.types.${properties.type.toLowerCase()}`, properties.type)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Description */}
        {properties.description && (
          <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
            {properties.description}
          </p>
        )}

        {/* Key Information */}
        <div className='space-y-2 mb-3'>
          {properties.acceptsNewMembers && (
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('map.acceptsNewMembers', 'New Members')}:
              </span>
              <Badge
                variant={
                  properties.acceptsNewMembers === 'yes'
                    ? 'default'
                    : properties.acceptsNewMembers === 'waitlist'
                      ? 'secondary'
                      : 'outline'
                }
                className='text-xs'
              >
                {t(
                  `map.acceptsNewMembers.${properties.acceptsNewMembers}`,
                  properties.acceptsNewMembers
                )}
              </Badge>
            </div>
          )}

          {properties.maximumMembers && (
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('map.maxMembers', 'Max Members')}:
              </span>
              <span className='text-xs'>{properties.maximumMembers}</span>
            </div>
          )}

          {properties.foundedAtYear && (
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('map.founded', 'Founded')}:
              </span>
              <span className='text-xs'>
                {properties.foundedAtMonth
                  ? `${properties.foundedAtMonth}/${properties.foundedAtYear}`
                  : properties.foundedAtYear}
              </span>
            </div>
          )}
        </div>

        {/* Goals and Products */}
        <div className='space-y-2'>
          {properties.goals && properties.goals.length > 0 && (
            <div>
              <span className='text-xs font-medium text-muted-foreground block mb-1'>
                {t('map.goals', 'Goals')}:
              </span>
              <div className='flex flex-wrap gap-1'>
                {properties.goals.slice(0, 3).map((goal) => (
                  <Badge key={goal.id} variant='secondary' className='text-xs'>
                    {goal.name}
                  </Badge>
                ))}
                {properties.goals.length > 3 && (
                  <Badge variant='outline' className='text-xs'>
                    +{properties.goals.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {properties.products && properties.products.length > 0 && (
            <div>
              <span className='text-xs font-medium text-muted-foreground block mb-1'>
                {t('map.products', 'Products')}:
              </span>
              <div className='flex flex-wrap gap-1'>
                {properties.products.slice(0, 3).map((product) => (
                  <Badge key={product.id} variant='outline' className='text-xs'>
                    {product.name}
                  </Badge>
                ))}
                {properties.products.length > 3 && (
                  <Badge variant='secondary' className='text-xs'>
                    +{properties.products.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Badges/Certifications */}
        {properties.badges && properties.badges.length > 0 && (
          <div className='mt-3 pt-3 border-t'>
            <div className='flex flex-wrap gap-1'>
              {properties.badges.slice(0, 2).map((badge) => (
                <Badge
                  key={badge.id}
                  variant='default'
                  className='text-xs bg-green-600 hover:bg-green-700'
                >
                  {badge.name}
                </Badge>
              ))}
              {properties.badges.length > 2 && (
                <Badge variant='outline' className='text-xs'>
                  +{properties.badges.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ListItemCard
