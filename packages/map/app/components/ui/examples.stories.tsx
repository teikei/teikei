import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './card'

const meta: Meta = {
  title: 'Examples/Component Examples',
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const FarmCard: Story = {
  name: 'Farm Profile Card',
  render: () => (
    <div className='max-w-md'>
      <Card>
        <CardHeader>
          <CardTitle>Biohof Müller</CardTitle>
          <CardDescription>
            Organic vegetables and herbs • Bavaria, Germany
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Members:</span>
            <span>32 families</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Season:</span>
            <span>April - October</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Delivery:</span>
            <span>Thursdays</span>
          </div>
        </CardContent>
        <CardFooter className='gap-2'>
          <Button variant='outline' className='flex-1'>
            Learn More
          </Button>
          <Button className='flex-1'>Join Now</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export const SearchForm: Story = {
  name: 'Farm Search Form',
  render: () => (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Find Local Farms</CardTitle>
        <CardDescription>
          Search for Community Supported Agriculture near you
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <label htmlFor='location' className='text-sm font-medium'>
            Location
          </label>
          <Input id='location' placeholder='Enter city or postal code...' />
        </div>
        <div className='space-y-2'>
          <label htmlFor='radius' className='text-sm font-medium'>
            Search Radius (km)
          </label>
          <Input id='radius' type='number' placeholder='25' />
        </div>
      </CardContent>
      <CardFooter>
        <Button className='w-full'>🔍 Search Farms</Button>
      </CardFooter>
    </Card>
  )
}

export const MemberSignupFlow: Story = {
  name: 'Member Signup Flow',
  render: () => (
    <div className='space-y-6 max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>Join Green Valley Farm</CardTitle>
          <CardDescription>
            Select your harvest share for the 2024 growing season
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='border-2 hover:border-primary cursor-pointer transition-colors'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg'>Half Share</CardTitle>
                <CardDescription>Perfect for 1-2 people</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold mb-2'>
                  €35<span className='text-sm font-normal'>/week</span>
                </p>
                <ul className='text-sm space-y-1 text-muted-foreground'>
                  <li>• 5-7 vegetable varieties</li>
                  <li>• Fresh herbs</li>
                  <li>• Bi-weekly eggs (optional)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className='border-2 hover:border-primary cursor-pointer transition-colors'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg'>Full Share</CardTitle>
                <CardDescription>Great for families</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold mb-2'>
                  €65<span className='text-sm font-normal'>/week</span>
                </p>
                <ul className='text-sm space-y-1 text-muted-foreground'>
                  <li>• 8-12 vegetable varieties</li>
                  <li>• Fresh herbs & flowers</li>
                  <li>• Weekly eggs (optional)</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className='pt-4 space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='pickup' className='text-sm font-medium'>
                Preferred Pickup Location
              </label>
              <select
                id='pickup'
                className='w-full px-3 py-2 border rounded-md'
              >
                <option>Farm Stand - Thursdays 3-7pm</option>
                <option>Munich Farmers Market - Saturdays 8am-12pm</option>
                <option>Delivery to Munich (€5 extra)</option>
              </select>
            </div>

            <div className='space-y-2'>
              <label htmlFor='start' className='text-sm font-medium'>
                Start Date
              </label>
              <Input id='start' type='date' />
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex-col gap-2'>
          <Button className='w-full'>Continue to Payment</Button>
          <p className='text-xs text-muted-foreground text-center'>
            You can pause or cancel your share anytime with 2 weeks notice
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export const AllButtonVariants: Story = {
  name: 'Button Showcase',
  render: () => (
    <div className='space-y-8'>
      <div>
        <h3 className='text-lg font-semibold mb-4'>All Button Variants</h3>
        <div className='flex flex-wrap gap-4'>
          <Button>Primary</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='link'>Link</Button>
          <Button variant='destructive'>Destructive</Button>
        </div>
      </div>

      <div>
        <h3 className='text-lg font-semibold mb-4'>Button Sizes</h3>
        <div className='flex items-end gap-4'>
          <Button size='sm'>Small</Button>
          <Button>Default</Button>
          <Button size='lg'>Large</Button>
          <Button size='icon'>🌱</Button>
        </div>
      </div>

      <div>
        <h3 className='text-lg font-semibold mb-4'>Button States</h3>
        <div className='flex flex-wrap gap-4'>
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button className='loading'>Loading...</Button>
        </div>
      </div>
    </div>
  )
}
