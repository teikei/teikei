import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Foundation/Typography',
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

const TypographySpecimen = ({
  tag,
  children,
  className = ''
}: {
  tag: keyof JSX.IntrinsicElements
  children: React.ReactNode
  className?: string
}) => {
  const Tag = tag as any
  return (
    <div className='mb-8 space-y-2'>
      <Tag className={className}>{children}</Tag>
      <div className='text-xs text-muted-foreground font-mono'>
        &lt;{tag}&gt; ·
        <span className='ml-2'>
          {typeof window !== 'undefined' && (
            <>
              {
                window.getComputedStyle(
                  document.querySelector(tag) || document.body
                ).fontSize
              }{' '}
              /
              {
                window.getComputedStyle(
                  document.querySelector(tag) || document.body
                ).lineHeight
              }
            </>
          )}
        </span>
      </div>
    </div>
  )
}

export const Headings: Story = {
  render: () => (
    <div className='space-y-6'>
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Heading Hierarchy</h2>
        <p className='text-muted-foreground mb-8'>
          Teikei uses a clear typographic hierarchy to organize content and
          guide users through the interface.
        </p>
      </div>

      <TypographySpecimen tag='h1'>
        Welcome to Teikei - Community Supported Agriculture
      </TypographySpecimen>

      <TypographySpecimen tag='h2'>
        Find Local Farms & Food Communities
      </TypographySpecimen>

      <TypographySpecimen tag='h3'>
        Organic Vegetables from Bavaria
      </TypographySpecimen>

      <TypographySpecimen tag='h4'>
        Weekly Harvest Share Details
      </TypographySpecimen>

      <TypographySpecimen tag='h5'>
        Pickup Location Information
      </TypographySpecimen>

      <TypographySpecimen tag='h6'>Additional Member Notes</TypographySpecimen>
    </div>
  )
}

export const BodyText: Story = {
  render: () => (
    <div className='space-y-6 max-w-prose'>
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Body Text Elements</h2>
        <p className='text-muted-foreground'>
          Content typography for reading and information display.
        </p>
      </div>

      <div className='space-y-6'>
        <div>
          <p className='mb-2'>
            Teikei connects consumers directly with local farmers through
            Community Supported Agriculture (CSA). Members receive fresh,
            seasonal produce while supporting sustainable farming practices in
            their region.
          </p>
          <code className='text-xs text-muted-foreground'>
            &lt;p&gt; - Body paragraph
          </code>
        </div>

        <div>
          <p className='lead text-lg mb-2'>
            Join a growing movement of people who care about where their food
            comes from and how it's produced.
          </p>
          <code className='text-xs text-muted-foreground'>
            &lt;p class="lead"&gt; - Lead paragraph
          </code>
        </div>

        <div>
          <p className='text-sm mb-2'>
            Note: Harvest shares are distributed weekly during the growing
            season from April through October.
          </p>
          <code className='text-xs text-muted-foreground'>
            &lt;p class="text-sm"&gt; - Small text
          </code>
        </div>

        <div>
          <p className='text-muted-foreground mb-2'>
            Additional information about delivery schedules and pickup locations
            can be found in your member handbook.
          </p>
          <code className='text-xs text-muted-foreground'>
            &lt;p class="text-muted-foreground"&gt; - Muted text
          </code>
        </div>
      </div>
    </div>
  )
}

export const InlineElements: Story = {
  render: () => (
    <div className='space-y-6 max-w-prose'>
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Inline Text Elements</h2>
        <p className='text-muted-foreground'>
          Text formatting and emphasis within paragraphs.
        </p>
      </div>

      <div className='space-y-4'>
        <p>
          Make text <strong>bold for emphasis</strong> using the strong tag.
        </p>

        <p>
          Add <em>italic emphasis</em> for subtle highlights.
        </p>

        <p>
          Display{' '}
          <code className='bg-muted px-1 py-0.5 rounded text-sm'>
            inline code
          </code>{' '}
          for technical terms.
        </p>

        <p>
          Mark{' '}
          <mark className='bg-yellow-200 dark:bg-yellow-900 px-1'>
            important information
          </mark>{' '}
          with highlighting.
        </p>

        <p>
          Show <del>removed content</del> and <ins>added content</ins> for
          changes.
        </p>

        <p>
          Use <small>small text</small> for fine print and notes.
        </p>

        <p>
          Reference footnotes<sup>1</sup> or show chemical formulas like H
          <sub>2</sub>O.
        </p>

        <p>
          Link to{' '}
          <a href='#' className='text-primary underline hover:no-underline'>
            other pages
          </a>{' '}
          or external resources.
        </p>
      </div>
    </div>
  )
}

export const Lists: Story = {
  render: () => (
    <div className='space-y-8 max-w-prose'>
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Lists</h2>
        <p className='text-muted-foreground'>
          Organized content using ordered and unordered lists.
        </p>
      </div>

      <div>
        <h3 className='font-semibold mb-3'>
          What's included in your harvest share:
        </h3>
        <ul className='list-disc list-inside space-y-1 mb-2'>
          <li>Fresh seasonal vegetables</li>
          <li>Herbs and salad greens</li>
          <li>Recipe suggestions</li>
          <li>Farm newsletter updates</li>
        </ul>
        <code className='text-xs text-muted-foreground'>
          &lt;ul&gt; - Unordered list
        </code>
      </div>

      <div>
        <h3 className='font-semibold mb-3'>How to join a CSA:</h3>
        <ol className='list-decimal list-inside space-y-1 mb-2'>
          <li>Find farms in your area</li>
          <li>Contact the farmer directly</li>
          <li>Sign up for a share</li>
          <li>Pick up your weekly harvest</li>
        </ol>
        <code className='text-xs text-muted-foreground'>
          &lt;ol&gt; - Ordered list
        </code>
      </div>
    </div>
  )
}

export const Blockquotes: Story = {
  render: () => (
    <div className='space-y-6 max-w-prose'>
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          Blockquotes & Code Blocks
        </h2>
        <p className='text-muted-foreground'>
          Displaying quotes and code snippets.
        </p>
      </div>

      <div>
        <blockquote className='border-l-4 border-primary pl-4 italic my-4'>
          "Community Supported Agriculture represents a new model for local food
          systems, one that values ecological stewardship, fair labor practices,
          and community connection."
          <footer className='text-sm text-muted-foreground mt-2 not-italic'>
            — Local Farmer, Bavaria
          </footer>
        </blockquote>
        <code className='text-xs text-muted-foreground'>
          &lt;blockquote&gt;
        </code>
      </div>

      <div>
        <pre className='bg-muted p-4 rounded overflow-x-auto mb-2'>
          <code>{`// Farm location coordinates
const farm = {
  name: "Biohof Müller",
  lat: 48.1351,
  lng: 11.5820,
  members: 32
};`}</code>
        </pre>
        <code className='text-xs text-muted-foreground'>
          &lt;pre&gt;&lt;code&gt; - Code block
        </code>
      </div>
    </div>
  )
}

export const CompleteExample: Story = {
  name: 'Complete Article Example',
  render: () => (
    <article className='max-w-prose space-y-6'>
      <header>
        <h1 className='text-3xl font-bold mb-2'>
          Understanding Community Supported Agriculture
        </h1>
        <p className='text-lg text-muted-foreground'>
          A guide to joining the local food movement
        </p>
      </header>

      <p className='lead text-lg'>
        Community Supported Agriculture (CSA) is transforming how people connect
        with their food sources, creating direct relationships between farmers
        and consumers.
      </p>

      <h2 className='text-2xl font-semibold mt-8 mb-4'>What is a CSA?</h2>
      <p>
        In a CSA model, members purchase <strong>shares</strong> of a farm's
        harvest in advance, providing farmers with upfront capital and sharing
        in both the <em>risks and rewards</em>
        of food production.
      </p>

      <h3 className='text-xl font-semibold mt-6 mb-3'>Benefits for Members</h3>
      <ul className='list-disc list-inside space-y-2 mb-4'>
        <li>Fresh, seasonal produce at peak flavor</li>
        <li>Support for local sustainable agriculture</li>
        <li>Connection to your food source</li>
        <li>Educational opportunities about farming</li>
      </ul>

      <blockquote className='border-l-4 border-primary pl-4 italic my-6'>
        "Joining our local CSA has completely changed how our family thinks
        about food. We eat seasonally now and have discovered vegetables we
        never knew existed!"
        <footer className='text-sm text-muted-foreground mt-2 not-italic'>
          — Maria, CSA Member since 2019
        </footer>
      </blockquote>

      <h3 className='text-xl font-semibold mt-6 mb-3'>Getting Started</h3>
      <p>
        Finding a CSA near you is easy with Teikei. Simply enter your location
        and browse available farms. Each listing includes details about:
      </p>

      <ol className='list-decimal list-inside space-y-2 my-4'>
        <li>Share sizes and pricing</li>
        <li>Pickup locations and schedules</li>
        <li>What's typically included in shares</li>
        <li>Farm practices and certifications</li>
      </ol>

      <p className='text-sm text-muted-foreground mt-6'>
        <small>
          Note: Most CSAs in Germany operate from April through October, with
          some offering winter shares for storage crops.
        </small>
      </p>
    </article>
  )
}
