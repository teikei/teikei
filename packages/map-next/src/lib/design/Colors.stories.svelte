<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design System/Tokens/Colors',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component:
						'Color tokens are read from the active CSS theme. Use the Storybook theme switcher to compare token values across supported data-theme variants.'
				}
			}
		}
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface ColorToken {
		name: string;
		variable: string;
		usage: string;
	}

	interface TokenGroup {
		title: string;
		description: string;
		tokens: ColorToken[];
	}

	const tokenGroups: TokenGroup[] = [
		{
			title: 'Core Surface',
			description: 'Default page, text, surface, border, and control tokens.',
			tokens: [
				{
					name: 'Background',
					variable: '--semantic-color-background',
					usage: 'Page and app background'
				},
				{
					name: 'Foreground',
					variable: '--semantic-color-foreground',
					usage: 'Primary text and icons'
				},
				{
					name: 'Surface',
					variable: '--semantic-color-surface',
					usage: 'Cards and raised panels'
				},
				{
					name: 'Muted',
					variable: '--semantic-color-muted',
					usage: 'Subtle backgrounds'
				},
				{
					name: 'Muted Foreground',
					variable: '--semantic-color-muted-foreground',
					usage: 'Secondary text'
				},
				{
					name: 'Border',
					variable: '--semantic-color-border',
					usage: 'Dividers and component borders'
				},
				{
					name: 'Input',
					variable: '--semantic-color-input',
					usage: 'Input and form control borders'
				},
				{
					name: 'Ring',
					variable: '--semantic-color-ring',
					usage: 'Focus indicators'
				}
			]
		},
		{
			title: 'Actions',
			description: 'Interactive action tokens used by buttons, links, and highlighted controls.',
			tokens: [
				{
					name: 'Primary',
					variable: '--semantic-color-primary',
					usage: 'Primary actions'
				},
				{
					name: 'Primary Hover',
					variable: '--semantic-color-primary-hover',
					usage: 'Primary action hover state'
				},
				{
					name: 'Primary Foreground',
					variable: '--semantic-color-primary-foreground',
					usage: 'Text and icons on primary'
				},
				{
					name: 'Secondary',
					variable: '--semantic-color-secondary',
					usage: 'Secondary surfaces'
				},
				{
					name: 'Secondary Foreground',
					variable: '--semantic-color-secondary-foreground',
					usage: 'Text and icons on secondary'
				},
				{
					name: 'Accent',
					variable: '--semantic-color-accent',
					usage: 'Hover and selected backgrounds'
				},
				{
					name: 'Accent Foreground',
					variable: '--semantic-color-accent-foreground',
					usage: 'Text and icons on accent'
				}
			]
		},
		{
			title: 'Feedback',
			description: 'Status and messaging tokens.',
			tokens: [
				{
					name: 'Success',
					variable: '--semantic-color-success',
					usage: 'Positive status'
				},
				{
					name: 'Success Muted',
					variable: '--semantic-color-success-muted',
					usage: 'Positive status background'
				},
				{
					name: 'Success Foreground',
					variable: '--semantic-color-success-foreground',
					usage: 'Text on success background'
				},
				{
					name: 'Success Border',
					variable: '--semantic-color-success-border',
					usage: 'Positive status border'
				},
				{
					name: 'Warning',
					variable: '--semantic-color-warning',
					usage: 'Warning status'
				},
				{
					name: 'Destructive',
					variable: '--semantic-color-destructive',
					usage: 'Danger and error states'
				},
				{
					name: 'Destructive Foreground',
					variable: '--semantic-color-destructive-foreground',
					usage: 'Text on destructive background'
				},
				{
					name: 'Overlay',
					variable: '--semantic-color-overlay',
					usage: 'Scrims and modal overlays'
				}
			]
		},
		{
			title: 'Sidebar And Auth',
			description: 'Application shell and authentication layout colors.',
			tokens: [
				{
					name: 'Sidebar',
					variable: '--semantic-color-sidebar',
					usage: 'Sidebar background'
				},
				{
					name: 'Sidebar Foreground',
					variable: '--semantic-color-sidebar-foreground',
					usage: 'Sidebar text and icons'
				},
				{
					name: 'Sidebar Accent',
					variable: '--semantic-color-sidebar-accent',
					usage: 'Sidebar hover and selected backgrounds'
				},
				{
					name: 'Sidebar Border',
					variable: '--semantic-color-sidebar-border',
					usage: 'Sidebar borders'
				},
				{
					name: 'Auth Panel',
					variable: '--semantic-color-auth-panel',
					usage: 'Authentication page panel'
				}
			]
		},
		{
			title: 'Map And Chart',
			description: 'Map rendering tokens and chart series colors.',
			tokens: [
				{
					name: 'Map Base',
					variable: '--semantic-color-map-base',
					usage: 'Base map color'
				},
				{
					name: 'Map Place Primary',
					variable: '--semantic-color-map-place-primary',
					usage: 'Primary place markers'
				},
				{
					name: 'Map Place Secondary',
					variable: '--semantic-color-map-place-secondary',
					usage: 'Secondary place markers'
				},
				{
					name: 'Map Cluster Primary',
					variable: '--semantic-color-map-cluster-primary',
					usage: 'Cluster markers'
				},
				{
					name: 'Map Popup',
					variable: '--semantic-color-map-popup',
					usage: 'Map popup surface'
				},
				{
					name: 'Chart 1',
					variable: '--semantic-color-chart-1',
					usage: 'Chart series'
				},
				{
					name: 'Chart 2',
					variable: '--semantic-color-chart-2',
					usage: 'Chart series'
				},
				{
					name: 'Chart 3',
					variable: '--semantic-color-chart-3',
					usage: 'Chart series'
				},
				{
					name: 'Chart 4',
					variable: '--semantic-color-chart-4',
					usage: 'Chart series'
				},
				{
					name: 'Chart 5',
					variable: '--semantic-color-chart-5',
					usage: 'Chart series'
				}
			]
		}
	];

	const tokenVariables = tokenGroups.flatMap((group) =>
		group.tokens.map((token) => token.variable)
	);

	let rootElement: HTMLDivElement;
	let resolvedValues = $state<Record<string, string>>({});

	function readTokenValues() {
		if (!rootElement) {
			return;
		}

		const styles = getComputedStyle(rootElement);
		resolvedValues = Object.fromEntries(
			tokenVariables.map((variable) => [variable, styles.getPropertyValue(variable).trim()])
		);
	}

	onMount(() => {
		readTokenValues();

		const observer = new MutationObserver(readTokenValues);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => observer.disconnect();
	});
</script>

<Story name="Palette">
	<div bind:this={rootElement} class="min-h-screen bg-background p-8 text-foreground">
		<div class="mx-auto flex max-w-6xl flex-col gap-10">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">Color Tokens</h1>
				<p class="max-w-3xl text-sm text-muted-foreground">
					These swatches use semantic CSS variables from the active theme. Prefer semantic tokens in
					components and keep base color names inside the theme source files.
				</p>
			</header>

			{#each tokenGroups as group (group.title)}
				<section class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<h2 class="text-lg font-semibold">{group.title}</h2>
						<p class="text-sm text-muted-foreground">{group.description}</p>
					</div>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each group.tokens as token (token.variable)}
							<article class="rounded-md border bg-card p-3 text-card-foreground">
								<div class="flex items-start gap-3">
									<div
										class="size-12 shrink-0 rounded-md border border-border shadow-xs"
										style:background={'var(' + token.variable + ')'}
									></div>
									<div class="min-w-0 flex-1">
										<h3 class="truncate text-sm font-medium">{token.name}</h3>
										<p class="text-xs text-muted-foreground">{token.usage}</p>
										<code class="mt-2 block truncate text-xs text-muted-foreground">
											{token.variable}
										</code>
										<p class="mt-1 truncate text-xs text-muted-foreground">
											{resolvedValues[token.variable] || 'unresolved'}
										</p>
									</div>
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</div>
</Story>
