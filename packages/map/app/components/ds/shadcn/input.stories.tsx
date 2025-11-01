import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '~/components/ds/shadcn/input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel']
    },
    disabled: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...'
  }
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...'
  }
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...'
  }
}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search farms...'
  }
}

export const WithValue: Story = {
  args: {
    value: 'Organic Farm Bavaria',
    placeholder: 'Enter text...'
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input...'
  }
}

export const WithLabel: Story = {
  render: () => (
    <div className='space-y-2'>
      <label htmlFor='farm-name' className='text-sm font-medium'>
        Farm Name
      </label>
      <Input id='farm-name' placeholder='Enter farm name...' />
    </div>
  )
}

export const Error: Story = {
  args: {
    'aria-invalid': true,
    placeholder: 'This field has an error...'
  }
}
