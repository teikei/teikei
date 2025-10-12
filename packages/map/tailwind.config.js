/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Typography from legacy SCSS
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        body: ['Roboto', 'Arial', 'sans-serif'],
        heading: ['Roboto Condensed', 'Roboto', 'Arial', 'sans-serif']
      },
      fontSize: {
        // Base size from SCSS
        base: '15px',
        // Custom sizes matching legacy
        22: '22px',
        nav: '14px'
      },
      fontWeight: {
        heading: '600',
        body: '400'
      },
      lineHeight: {
        'tight-heading': '1.2',
        base: '1.5'
      },
      // Extend existing CSS variables with legacy colors
      colors: {
        // Keep existing CSS variable colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          // Legacy greens
          legacy: '#00a552',
          bright: '#1fc848',
          dark: '#34a750'
        },
        // Legacy colors that don't conflict with CSS variables
        legacy: {
          blue: '#3e6889',
          darkBlue: '#264155',
          red: '#c60f13',
          charcoal: '#253d4c',
          grey: '#909090',
          lightGrey: '#e7e7e7',
          orange: '#e85e15',
          purple: '#b22d69',
          beige: '#f6f1e3'
        },
        // Existing CSS variable colors
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))'
        }
      },
      // Legacy spacing from SCSS
      spacing: {
        gutter: '25px'
      },
      // Legacy border radius
      borderRadius: {
        button: '2px',
        form: '3px',
        card: '5px'
      },
      // Typography plugin configuration
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontFamily: theme('fontFamily.sans').join(', '),
            fontSize: theme('fontSize.base'),
            lineHeight: theme('lineHeight.base'),
            color: theme('colors.foreground'),
            h1: {
              fontSize: '22px',
              lineHeight: theme('lineHeight.tight-heading'),
              fontWeight: 'bold',
              fontFamily: theme('fontFamily.heading').join(', '),
              color: theme('colors.foreground')
            },
            h2: {
              fontSize: '22px',
              lineHeight: theme('lineHeight.tight-heading'),
              fontWeight: theme('fontWeight.heading'),
              fontFamily: theme('fontFamily.heading').join(', '),
              color: theme('colors.foreground'),
              marginTop: '1em',
              marginBottom: '0',
              paddingTop: '0'
            },
            h3: {
              fontSize: '16px',
              fontWeight: theme('fontWeight.heading'),
              fontFamily: theme('fontFamily.heading').join(', '),
              color: theme('colors.foreground')
            },
            h4: {
              fontSize: '16px',
              fontWeight: theme('fontWeight.heading'),
              fontFamily: theme('fontFamily.heading').join(', '),
              color: theme('colors.foreground')
            },
            h5: {
              fontSize: '14px',
              fontWeight: theme('fontWeight.heading'),
              fontFamily: theme('fontFamily.heading').join(', '),
              color: theme('colors.foreground')
            },
            h6: {
              fontSize: '14px',
              fontWeight: theme('fontWeight.heading'),
              fontFamily: theme('fontFamily.heading').join(', '),
              color: theme('colors.foreground')
            },
            p: {
              fontSize: theme('fontSize.base'),
              lineHeight: theme('lineHeight.base'),
              color: theme('colors.foreground')
            },
            a: {
              color: theme('colors.primary.DEFAULT'),
              textDecoration: 'underline',
              '&:hover': {
                color: theme('colors.primary.DEFAULT'),
                opacity: '0.8'
              }
            },
            strong: {
              fontWeight: theme('fontWeight.bold'),
              color: theme('colors.foreground')
            },
            code: {
              fontSize: '0.875em',
              backgroundColor: theme('colors.muted.DEFAULT'),
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              borderRadius: '0.25rem'
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            }
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
