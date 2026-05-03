import type { DesignTheme } from '../themes.js';

// color
const WHITE = 'oklch(1 0 0)';
const FOREGROUND = 'oklch(0.18 0.018 248)';
const PRIMARY = 'oklch(0.43 0.118 238)';
const PRIMARY_FOREGROUND = 'oklch(0.985 0.01 230)';
const SECONDARY = 'oklch(0.94 0.025 200)';
const SECONDARY_FOREGROUND = 'oklch(0.24 0.04 238)';
const MUTED_FOREGROUND = 'oklch(0.48 0.035 245)';
const DESTRUCTIVE = 'oklch(0.58 0.22 27)';
const BORDER = 'oklch(0.88 0.018 238)';
const CHART_1 = 'oklch(0.56 0.18 238)';
const CHART_2 = 'oklch(0.57 0.12 158)';
const CHART_3 = 'oklch(0.67 0.16 82)';
const CHART_4 = 'oklch(0.58 0.16 20)';
const CHART_5 = 'oklch(0.48 0.12 305)';
const SIDEBAR = 'oklch(0.97 0.012 235)';
const MAP_BASE_COLOR = '#2c5f7a';

// typography
const FONT_SANS = 'Inter, ui-sans-serif, system-ui, sans-serif';
const FONT_REGULAR = 'roboto_regular';
const FONT_BOLD = 'roboto_bold';

export const clientDemoTheme = {
	id: 'client-demo',
	label: 'Client Demo',
	description: 'Example client override proving that one bundle can expose multiple token sets.',
	cssVars: {
		radius: '0.375rem',
		'font-family-sans': FONT_SANS,
		background: WHITE,
		foreground: FOREGROUND,
		card: WHITE,
		'card-foreground': FOREGROUND,
		popover: WHITE,
		'popover-foreground': FOREGROUND,
		primary: PRIMARY,
		'primary-foreground': PRIMARY_FOREGROUND,
		secondary: SECONDARY,
		'secondary-foreground': SECONDARY_FOREGROUND,
		muted: SECONDARY,
		'muted-foreground': MUTED_FOREGROUND,
		accent: SECONDARY,
		'accent-foreground': SECONDARY_FOREGROUND,
		destructive: DESTRUCTIVE,
		border: BORDER,
		input: BORDER,
		ring: PRIMARY,
		'chart-1': CHART_1,
		'chart-2': CHART_2,
		'chart-3': CHART_3,
		'chart-4': CHART_4,
		'chart-5': CHART_5,
		sidebar: SIDEBAR,
		'sidebar-foreground': FOREGROUND,
		'sidebar-primary': PRIMARY,
		'sidebar-primary-foreground': PRIMARY_FOREGROUND,
		'sidebar-accent': SECONDARY,
		'sidebar-accent-foreground': SECONDARY_FOREGROUND,
		'sidebar-border': BORDER,
		'sidebar-ring': PRIMARY
	},
	map: {
		baseColor: MAP_BASE_COLOR,
		fontRegular: FONT_REGULAR,
		fontBold: FONT_BOLD
	}
} as const satisfies DesignTheme;
