import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-svelte-csf', '@storybook/addon-themes'],
	framework: '@storybook/sveltekit',
	docs: {
		autodocs: 'tag'
	}
};

export default config;
