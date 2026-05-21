import '../src/routes/layout.css';

import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/sveltekit';

const preview: Preview = {
	decorators: [
		withThemeByDataAttribute({
			themes: {
				Teikei: 'teikei',
				'Client Demo': 'client-demo'
			},
			defaultTheme: 'Teikei',
			attributeName: 'data-theme'
		})
	],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		layout: 'centered'
	}
};

export default preview;
