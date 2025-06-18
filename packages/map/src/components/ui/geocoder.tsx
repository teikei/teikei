import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MapPin, Search } from 'lucide-react'
import * as React from 'react'
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues
} from 'react-hook-form'

interface GeocoderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>
  name: TName
  placeholder?: string
  className?: string
  onAddressSelect?: (address: {
    city: string
    address: string
    latitude: number
    longitude: number
  }) => void
}

interface GeocodeResult {
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    road?: string
    house_number?: string
    postcode?: string
  }
}

export function Geocoder<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  placeholder = 'Adresse eingeben...',
  className,
  onAddressSelect,
  ...props
}: GeocoderProps<TFieldValues, TName>) {
  const [searchValue, setSearchValue] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<GeocodeResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const debounceRef = React.useRef<NodeJS.Timeout>()

  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control
  })

  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Using Nominatim for geocoding (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          query
        )}&countrycodes=de,at,ch&accept-language=de`
      )
      const results: GeocodeResult[] = await response.json()
      setSuggestions(results)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Geocoding error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setSearchValue(value)
    field.onChange(value)

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 300)
  }

  const handleSuggestionSelect = (suggestion: GeocodeResult) => {
    const city =
      suggestion.address.city ||
      suggestion.address.town ||
      suggestion.address.village ||
      suggestion.address.municipality ||
      ''

    const street = suggestion.address.road || ''
    const houseNumber = suggestion.address.house_number || ''
    const address = `${street} ${houseNumber}`.trim()

    const addressData = {
      city,
      address: address || suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    }

    setSearchValue(suggestion.display_name)
    field.onChange(suggestion.display_name)
    setShowSuggestions(false)

    if (onAddressSelect) {
      onAddressSelect(addressData)
    }
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation wird von diesem Browser nicht unterstützt')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=de`
          )
          const result: GeocodeResult = await response.json()

          if (result) {
            handleSuggestionSelect(result)
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLoading(false)
        alert('Standort konnte nicht ermittelt werden')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Input
            {...props}
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow for selection
              setTimeout(() => setShowSuggestions(false), 200)
            }}
            placeholder={placeholder}
            className={cn(error && 'border-destructive')}
          />
          <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        </div>

        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={handleCurrentLocation}
          disabled={isLoading}
          title='Aktuellen Standort verwenden'
        >
          <MapPin className='h-4 w-4' />
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className='absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-md'>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type='button'
              className='w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className='flex items-start gap-2'>
                <MapPin className='mt-0.5 h-3 w-3 text-muted-foreground flex-shrink-0' />
                <span className='truncate'>{suggestion.display_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className='absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-2 shadow-md'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground' />
            Suche läuft...
          </div>
        </div>
      )}
    </div>
  )
}
