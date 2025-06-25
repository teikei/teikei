import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'

const meta: Meta = {
  title: 'Foundation/Colors',
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

interface ColorInfo {
  name: string
  variable: string
  value: string
  category: string
}

const getContrastRatio = (color1: string, color2: string): number => {
  // Simple contrast calculation - in production use a proper library
  return 1
}

const ColorSwatch = ({ color }: { color: ColorInfo }) => {
  const [computedValue, setComputedValue] = useState(color.value)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(color.variable)
        .trim()
      if (value) setComputedValue(value)
    }
  }, [color.variable])

  return (
    <div className='space-y-2'>
      <div
        className='h-24 rounded-lg border shadow-sm'
        style={{ backgroundColor: `var(${color.variable})` }}
      />
      <div className='space-y-1'>
        <h4 className='font-medium text-sm'>{color.name}</h4>
        <p className='text-xs font-mono text-muted-foreground'>
          {color.variable}
        </p>
        <p className='text-xs text-muted-foreground'>{computedValue}</p>
      </div>
    </div>
  )
}

const ColorCombo = ({
  bgVar,
  textVar,
  title
}: {
  bgVar: string
  textVar: string
  title: string
}) => (
  <div
    className='p-4 rounded-lg border'
    style={{
      backgroundColor: `var(${bgVar})`,
      color: `var(${textVar})`
    }}
  >
    <h4 className='font-medium mb-1'>{title}</h4>
    <p className='text-sm'>The quick brown fox jumps over the lazy dog</p>
    <div className='mt-2 text-xs opacity-75 font-mono'>
      {bgVar} / {textVar}
    </div>
  </div>
)

// Define color categories based on your CSS variables
const colorCategories = {
  'Core Colors': [
    {
      name: 'Background',
      variable: '--background',
      value: '#ffffff',
      category: 'Core'
    },
    {
      name: 'Foreground',
      variable: '--foreground',
      value: '#0a423d',
      category: 'Core'
    },
    {
      name: 'Primary',
      variable: '--primary',
      value: '#20664c',
      category: 'Core'
    },
    {
      name: 'Primary Foreground',
      variable: '--primary-foreground',
      value: '#fbfbfb',
      category: 'Core'
    }
  ],
  'Semantic Colors': [
    {
      name: 'Secondary',
      variable: '--secondary',
      value: '#e9f2ee',
      category: 'Semantic'
    },
    {
      name: 'Secondary Foreground',
      variable: '--secondary-foreground',
      value: '#343434',
      category: 'Semantic'
    },
    {
      name: 'Destructive',
      variable: '--destructive',
      value: '#fa2c40',
      category: 'Semantic'
    },
    {
      name: 'Destructive Foreground',
      variable: '--destructive-foreground',
      value: '#ffffff',
      category: 'Semantic'
    }
  ],
  'UI Colors': [
    { name: 'Muted', variable: '--muted', value: '#f7f7f7', category: 'UI' },
    {
      name: 'Muted Foreground',
      variable: '--muted-foreground',
      value: '#8e8e8e',
      category: 'UI'
    },
    { name: 'Accent', variable: '--accent', value: '#e9f2ee', category: 'UI' },
    {
      name: 'Accent Foreground',
      variable: '--accent-foreground',
      value: '#343434',
      category: 'UI'
    }
  ],
  'Component Colors': [
    {
      name: 'Card',
      variable: '--card',
      value: '#ffffff',
      category: 'Component'
    },
    {
      name: 'Card Foreground',
      variable: '--card-foreground',
      value: '#252525',
      category: 'Component'
    },
    {
      name: 'Popover',
      variable: '--popover',
      value: '#ffffff',
      category: 'Component'
    },
    {
      name: 'Popover Foreground',
      variable: '--popover-foreground',
      value: '#252525',
      category: 'Component'
    }
  ],
  'Form Colors': [
    {
      name: 'Border',
      variable: '--border',
      value: '#ebebeb',
      category: 'Form'
    },
    { name: 'Input', variable: '--input', value: '#ebebeb', category: 'Form' },
    { name: 'Ring', variable: '--ring', value: '#b5b5b5', category: 'Form' }
  ],
  'Chart Colors': [
    {
      name: 'Chart 1',
      variable: '--chart-1',
      value: '#f9b350',
      category: 'Chart'
    },
    {
      name: 'Chart 2',
      variable: '--chart-2',
      value: '#46ece8',
      category: 'Chart'
    },
    {
      name: 'Chart 3',
      variable: '--chart-3',
      value: '#1748b4',
      category: 'Chart'
    },
    {
      name: 'Chart 4',
      variable: '--chart-4',
      value: '#e1f4b3',
      category: 'Chart'
    },
    {
      name: 'Chart 5',
      variable: '--chart-5',
      value: '#eef494',
      category: 'Chart'
    }
  ]
}

export const ColorPalette: Story = {
  render: () => (
    <div className='space-y-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Teikei Color System</h1>
        <p className='text-muted-foreground'>
          A nature-inspired color palette that reflects the connection between
          farmers and communities.
        </p>
      </div>

      {Object.entries(colorCategories).map(([category, colors]) => (
        <div key={category}>
          <h2 className='text-xl font-semibold mb-4'>{category}</h2>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8'>
            {colors.map((color) => (
              <ColorSwatch key={color.variable} color={color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export const ColorCombinations: Story = {
  name: 'Text & Background Combinations',
  render: () => (
    <div className='space-y-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Color Combinations</h1>
        <p className='text-muted-foreground'>
          Accessible text and background color pairings used throughout the
          application.
        </p>
      </div>

      <div className='grid gap-4'>
        <ColorCombo
          bgVar='--background'
          textVar='--foreground'
          title='Default Content'
        />
        <ColorCombo
          bgVar='--primary'
          textVar='--primary-foreground'
          title='Primary Actions'
        />
        <ColorCombo
          bgVar='--secondary'
          textVar='--secondary-foreground'
          title='Secondary Elements'
        />
        <ColorCombo
          bgVar='--destructive'
          textVar='--destructive-foreground'
          title='Destructive Actions'
        />
        <ColorCombo
          bgVar='--muted'
          textVar='--muted-foreground'
          title='Muted Content'
        />
        <ColorCombo
          bgVar='--accent'
          textVar='--accent-foreground'
          title='Accent Elements'
        />
        <ColorCombo
          bgVar='--card'
          textVar='--card-foreground'
          title='Card Content'
        />
      </div>
    </div>
  )
}

export const SemanticColors: Story = {
  name: 'Semantic Color Usage',
  render: () => (
    <div className='space-y-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Semantic Color Usage</h1>
        <p className='text-muted-foreground'>
          How colors convey meaning and guide user actions in the Teikei
          interface.
        </p>
      </div>

      <div className='space-y-6'>
        <div className='p-6 border rounded-lg bg-primary/10'>
          <h3 className='font-semibold text-lg mb-2 text-primary'>
            Primary - Growth & Nature
          </h3>
          <p className='mb-4'>
            Our primary green reflects the agricultural focus of Teikei,
            representing growth, sustainability, and the natural world. Used for
            primary actions and key interface elements.
          </p>
          <div className='flex gap-2'>
            <button className='bg-primary text-primary-foreground px-4 py-2 rounded'>
              Join Farm
            </button>
            <button className='text-primary border border-primary px-4 py-2 rounded'>
              Learn More
            </button>
          </div>
        </div>

        <div className='p-6 border rounded-lg bg-secondary'>
          <h3 className='font-semibold text-lg mb-2'>
            Secondary - Support & Information
          </h3>
          <p className='mb-4'>
            A soft, muted green provides supporting information and secondary
            actions without competing with primary elements.
          </p>
          <div className='flex gap-2'>
            <button className='bg-secondary text-secondary-foreground px-4 py-2 rounded'>
              View Details
            </button>
            <span className='bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm'>
              32 Members
            </span>
          </div>
        </div>

        <div className='p-6 border rounded-lg bg-destructive/10'>
          <h3 className='font-semibold text-lg mb-2 text-destructive'>
            Destructive - Caution & Removal
          </h3>
          <p className='mb-4'>
            Red indicates potentially destructive actions that require user
            attention and confirmation, such as canceling memberships or
            deleting data.
          </p>
          <div className='flex gap-2'>
            <button className='bg-destructive text-destructive-foreground px-4 py-2 rounded'>
              Cancel Membership
            </button>
            <button className='text-destructive border border-destructive px-4 py-2 rounded'>
              Remove
            </button>
          </div>
        </div>

        <div className='p-6 border rounded-lg bg-muted'>
          <h3 className='font-semibold text-lg mb-2'>
            Muted - Subtle Information
          </h3>
          <p className='text-muted-foreground mb-4'>
            Muted colors provide subtle backgrounds and de-emphasized text for
            secondary information that shouldn't distract from main content.
          </p>
          <div className='flex gap-2 items-center'>
            <span className='text-muted-foreground text-sm'>
              Last updated: 2 days ago
            </span>
            <span className='bg-muted px-2 py-1 rounded text-xs'>Draft</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ChartColors: Story = {
  name: 'Data Visualization Colors',
  render: () => (
    <div className='space-y-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Chart & Data Colors</h1>
        <p className='text-muted-foreground'>
          A vibrant palette for data visualization that maintains accessibility
          and distinction.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <div
            className='w-12 h-12 rounded'
            style={{ backgroundColor: 'var(--chart-1)' }}
          />
          <div>
            <p className='font-medium'>Vegetables</p>
            <p className='text-sm text-muted-foreground'>
              Primary produce category
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <div
            className='w-12 h-12 rounded'
            style={{ backgroundColor: 'var(--chart-2)' }}
          />
          <div>
            <p className='font-medium'>Fruits</p>
            <p className='text-sm text-muted-foreground'>
              Seasonal fruit harvests
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <div
            className='w-12 h-12 rounded'
            style={{ backgroundColor: 'var(--chart-3)' }}
          />
          <div>
            <p className='font-medium'>Dairy</p>
            <p className='text-sm text-muted-foreground'>
              Milk and cheese products
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <div
            className='w-12 h-12 rounded'
            style={{ backgroundColor: 'var(--chart-4)' }}
          />
          <div>
            <p className='font-medium'>Herbs</p>
            <p className='text-sm text-muted-foreground'>
              Fresh herbs and aromatics
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <div
            className='w-12 h-12 rounded'
            style={{ backgroundColor: 'var(--chart-5)' }}
          />
          <div>
            <p className='font-medium'>Grains</p>
            <p className='text-sm text-muted-foreground'>
              Whole grains and flours
            </p>
          </div>
        </div>
      </div>

      <div className='mt-8 p-4 bg-muted rounded-lg'>
        <p className='text-sm'>
          <strong>Note:</strong> Chart colors are optimized for distinction and
          accessibility. They maintain sufficient contrast and are
          distinguishable for users with common forms of color blindness.
        </p>
      </div>
    </div>
  )
}
