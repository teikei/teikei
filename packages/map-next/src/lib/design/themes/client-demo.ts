import type { DesignTheme } from '../themes.js';

export const clientDemoTheme = {
	id: 'client-demo',
	label: 'Client Demo',
	description: 'Example client override proving that one bundle can expose multiple token sets.',
	cssVars: {
		radius: '0.375rem',
		'font-family-sans': 'Inter, ui-sans-serif, system-ui, sans-serif',
		background: 'oklch(0.995 0.005 95)',
		foreground: 'oklch(0.18 0.018 248)',
		card: 'oklch(1 0 0)',
		'card-foreground': 'oklch(0.18 0.018 248)',
		popover: 'oklch(1 0 0)',
		'popover-foreground': 'oklch(0.18 0.018 248)',
		primary: 'oklch(0.43 0.118 238)',
		'primary-foreground': 'oklch(0.985 0.01 230)',
		secondary: 'oklch(0.94 0.025 200)',
		'secondary-foreground': 'oklch(0.24 0.04 238)',
		muted: 'oklch(0.955 0.012 235)',
		'muted-foreground': 'oklch(0.48 0.035 245)',
		accent: 'oklch(0.9 0.06 82)',
		'accent-foreground': 'oklch(0.24 0.04 70)',
		destructive: 'oklch(0.58 0.22 27)',
		border: 'oklch(0.88 0.018 238)',
		input: 'oklch(0.88 0.018 238)',
		ring: 'oklch(0.43 0.118 238)',
		'chart-1': 'oklch(0.56 0.18 238)',
		'chart-2': 'oklch(0.57 0.12 158)',
		'chart-3': 'oklch(0.67 0.16 82)',
		'chart-4': 'oklch(0.58 0.16 20)',
		'chart-5': 'oklch(0.48 0.12 305)',
		sidebar: 'oklch(0.97 0.012 235)',
		'sidebar-foreground': 'oklch(0.18 0.018 248)',
		'sidebar-primary': 'oklch(0.43 0.118 238)',
		'sidebar-primary-foreground': 'oklch(0.985 0.01 230)',
		'sidebar-accent': 'oklch(0.9 0.06 82)',
		'sidebar-accent-foreground': 'oklch(0.24 0.04 70)',
		'sidebar-border': 'oklch(0.88 0.018 238)',
		'sidebar-ring': 'oklch(0.43 0.118 238)'
	},
	map: {
		baseColor: '#2c5f7a',
		fontRegular: 'roboto_regular',
		fontBold: 'roboto_bold'
	}
} as const satisfies DesignTheme;
