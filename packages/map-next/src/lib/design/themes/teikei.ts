import type { DesignTheme } from '../themes.js';

// color
const WHITE = 'oklch(1 0 0)';
const FOREGROUND = 'oklch(0.141 0.005 285.823)';
const PRIMARY = 'oklch(0.421 0.069 164.145)';
const PRIMARY_FOREGROUND = 'oklch(0.982 0.018 155.826)';
const SECONDARY = 'oklch(0.967 0.001 286.375)';
const SECONDARY_FOREGROUND = 'oklch(0.21 0.006 285.885)';
const MUTED_FOREGROUND = 'oklch(0.552 0.016 285.938)';
const DESTRUCTIVE = 'oklch(0.577 0.245 27.325)';
const BORDER = 'oklch(0.92 0.004 286.32)';
const CHART_1 = 'oklch(0.646 0.222 41.116)';
const CHART_2 = 'oklch(0.6 0.118 184.704)';
const CHART_3 = 'oklch(0.398 0.07 227.392)';
const CHART_4 = 'oklch(0.828 0.189 84.429)';
const CHART_5 = 'oklch(0.769 0.188 70.08)';
const SIDEBAR = 'oklch(0.985 0 0)';
const MAP_BASE_COLOR = '#266050';

// typography
const FONT_REGULAR = 'roboto_regular';
const FONT_BOLD = 'roboto_bold';
const FONT_SANS = 'Inter, ui-sans-serif, system-ui, sans-serif';

export const teikeiTheme = {
	id: 'teikei',
	label: 'Teikei',
	description:
		'Default Teikei theme used for the standalone app and embeds without an explicit theme.',
	cssVars: {
		radius: '0.5rem',
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
