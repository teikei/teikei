import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import * as React from 'react'
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues
} from 'react-hook-form'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>
  name: TName
  options: MultiSelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  maxItems?: number
}

export function MultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  options,
  placeholder = 'Auswählen...',
  className,
  disabled = false,
  maxItems,
  ...props
}: MultiSelectProps<TFieldValues, TName>) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control
  })

  const selectedValues: string[] = Array.isArray(field.value) ? field.value : []

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleSelect = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((value) => value !== optionValue)
      : [...selectedValues, optionValue]

    field.onChange(newValues)
  }

  const handleRemove = (optionValue: string) => {
    const newValues = selectedValues.filter((value) => value !== optionValue)
    field.onChange(newValues)
  }

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  )

  const canAddMore = !maxItems || selectedValues.length < maxItems

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={cn(
              'w-full justify-between',
              error && 'border-destructive',
              !selectedValues.length && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} ausgewählt`
              : placeholder}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <Command>
            <CommandInput
              placeholder='Suchen...'
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>Keine Optionen gefunden.</CommandEmpty>
            <CommandGroup className='max-h-64 overflow-auto'>
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                const isDisabled = !canAddMore && !isSelected

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      if (!isDisabled) {
                        handleSelect(option.value)
                      }
                    }}
                    className={cn(
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                    {maxItems && !isSelected && !canAddMore && (
                      <span className='ml-auto text-xs text-muted-foreground'>
                        Max. erreicht
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant='secondary' className='text-xs'>
              {option.label}
              {!disabled && (
                <button
                  type='button'
                  className='ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemove(option.value)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleRemove(option.value)}
                >
                  <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {maxItems && (
        <p className='text-xs text-muted-foreground'>
          {selectedValues.length} von {maxItems} ausgewählt
        </p>
      )}
    </div>
  )
}
