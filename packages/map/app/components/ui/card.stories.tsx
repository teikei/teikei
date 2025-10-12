import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '~/components/ui/button'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Community Supported Agriculture</CardTitle>
        <CardDescription>
          Discover local farms and food communities near you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Teikei helps you find Community Supported Agriculture initiatives in
          Germany, Switzerland, and Austria. Connect with local farmers and
          support sustainable agriculture in your area.
        </p>
      </CardContent>
      <CardFooter>
        <Button>Learn More</Button>
      </CardFooter>
    </Card>
  )
}

export const WithAction: Story = {
  render: () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Farm Profile</CardTitle>
        <CardDescription>Organic vegetables and fruits</CardDescription>
        <CardAction>
          <Button variant='outline' size='sm'>
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p className='text-sm'>Location: Bavaria, Germany</p>
          <p className='text-sm'>Members: 25 families</p>
          <p className='text-sm'>Season: March - November</p>
        </div>
      </CardContent>
      <CardFooter className='justify-between'>
        <Button variant='outline'>Contact</Button>
        <Button>Join</Button>
      </CardFooter>
    </Card>
  )
}

export const Simple: Story = {
  render: () => (
    <Card className='w-[300px]'>
      <CardContent>
        <p>A simple card with just content.</p>
      </CardContent>
    </Card>
  )
}

export const HeaderOnly: Story = {
  render: () => (
    <Card className='w-[300px]'>
      <CardHeader>
        <CardTitle>Header Only</CardTitle>
        <CardDescription>This card only has a header section.</CardDescription>
      </CardHeader>
    </Card>
  )
}
