import type { DesignTheme } from '../themes.js';

export const teikeiTheme = {
	id: 'teikei',
	label: 'Teikei',
	description:
		'Default Teikei theme used for the standalone app and embeds without an explicit theme.',
	cssVars: {
		radius: '0.5rem',
		'font-family-sans': 'Inter, ui-sans-serif, system-ui, sans-serif',
		background: 'oklch(1 0 0)',
		foreground: 'oklch(0.141 0.005 285.823)',
		card: 'oklch(1 0 0)',
		'card-foreground': 'oklch(0.141 0.005 285.823)',
		popover: 'oklch(1 0 0)',
		'popover-foreground': 'oklch(0.141 0.005 285.823)',
		primary: 'oklch(0.421 0.069 164.145)',
		'primary-foreground': 'oklch(0.982 0.018 155.826)',
		secondary: 'oklch(0.967 0.001 286.375)',
		'secondary-foreground': 'oklch(0.21 0.006 285.885)',
		muted: 'oklch(0.967 0.001 286.375)',
		'muted-foreground': 'oklch(0.552 0.016 285.938)',
		accent: 'oklch(0.967 0.001 286.375)',
		'accent-foreground': 'oklch(0.21 0.006 285.885)',
		destructive: 'oklch(0.577 0.245 27.325)',
		border: 'oklch(0.92 0.004 286.32)',
		input: 'oklch(0.92 0.004 286.32)',
		ring: 'oklch(0.421 0.069 164.145)',
		'chart-1': 'oklch(0.646 0.222 41.116)',
		'chart-2': 'oklch(0.6 0.118 184.704)',
		'chart-3': 'oklch(0.398 0.07 227.392)',
		'chart-4': 'oklch(0.828 0.189 84.429)',
		'chart-5': 'oklch(0.769 0.188 70.08)',
		sidebar: 'oklch(0.985 0 0)',
		'sidebar-foreground': 'oklch(0.141 0.005 285.823)',
		'sidebar-primary': 'oklch(0.421 0.069 164.145)',
		'sidebar-primary-foreground': 'oklch(0.982 0.018 155.826)',
		'sidebar-accent': 'oklch(0.967 0.001 286.375)',
		'sidebar-accent-foreground': 'oklch(0.21 0.006 285.885)',
		'sidebar-border': 'oklch(0.92 0.004 286.32)',
		'sidebar-ring': 'oklch(0.421 0.069 164.145)'
	},
	map: {
		baseColor: '#266050',
		fontRegular: 'roboto_regular',
		fontBold: 'roboto_bold'
	}
} as const satisfies DesignTheme;
