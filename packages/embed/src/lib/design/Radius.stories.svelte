<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design System/Tokens/Radius',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component:
						'Radius tokens are derived from `--base-radius` in the active theme. The base value differs per theme (Teikei is rounder than Client Demo), so use the Storybook theme switcher to compare. Values are read live from the rendered swatches.'
				}
			}
		}
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface RadiusToken {
		name: string;
		variable: string;
		utility: string;
		usage: string;
	}

	const radiusTokens: RadiusToken[] = [
		{
			name: 'Base',
			variable: '--base-radius',
			utility: '—',
			usage: 'Source value; client themes override this'
		},
		{
			name: 'Small',
			variable: '--radius-sm',
			utility: 'rounded-sm',
			usage: 'Reserved; unused today'
		},
		{
			name: 'Medium',
			variable: '--radius-md',
			utility: 'rounded-md',
			usage: 'Nested tier: list/entry rows, depot cards, dropdown/select/command items'
		},
		{
			name: 'Large',
			variable: '--radius-lg',
			utility: 'rounded-lg',
			usage: 'Reserved; unused today'
		},
		{
			name: 'Extra Large',
			variable: '--radius-xl',
			utility: 'rounded-xl',
			usage:
				'Control tier: buttons, inputs, textareas, selects, dropdown/select popovers, input-group'
		},
		{
			name: '2XL',
			variable: '--radius-2xl',
			utility: 'rounded-2xl',
			usage:
				'Outside the two-tier system: sidebar floating/inset corners, alerts, skeletons, field-label'
		},
		{
			name: '3XL',
			variable: '--radius-3xl',
			utility: 'rounded-3xl',
			usage: 'Reserved; unused today'
		},
		{
			name: '4XL',
			variable: '--radius-4xl',
			utility: 'rounded-4xl',
			usage:
				'Container tier: cards, dialogs, sidebar shell, bottom sheet, search pill, map controls'
		}
	];

	let swatchElements: HTMLDivElement[] = $state([]);
	let resolvedValues = $state<Record<string, string>>({});

	function readRadiusValues() {
		resolvedValues = Object.fromEntries(
			radiusTokens.map((token, index) => {
				const element = swatchElements[index];
				const value = element ? getComputedStyle(element).borderTopLeftRadius : '';
				return [token.variable, value];
			})
		);
	}

	onMount(() => {
		readRadiusValues();

		const observer = new MutationObserver(readRadiusValues);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => observer.disconnect();
	});
</script>

<Story name="Scale">
	<div class="min-h-screen bg-background p-8 text-foreground">
		<div class="mx-auto flex max-w-6xl flex-col gap-10">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">Radius Tokens</h1>
				<p class="max-w-3xl text-sm text-muted-foreground">
					The scale is computed from <code>--base-radius</code> in
					<code>theme-vars.css</code> and exposed as Tailwind <code>rounded-*</code> utilities in
					<code>layout.css</code>. Prefer the utilities in components; switch themes to see the base
					radius change.
				</p>
			</header>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{#each radiusTokens as token, index (token.variable)}
					<article class="flex flex-col gap-3 rounded-md border bg-card p-3 text-card-foreground">
						<div
							bind:this={swatchElements[index]}
							class="h-20 w-full border border-border bg-muted shadow-xs"
							style:border-radius={'var(' + token.variable + ')'}
						></div>
						<div class="min-w-0">
							<h3 class="truncate text-sm font-medium">{token.name}</h3>
							<p class="text-xs text-muted-foreground">{token.usage}</p>
							<code class="mt-2 block truncate text-xs text-muted-foreground">{token.variable}</code
							>
							<p class="truncate text-xs text-muted-foreground">
								{token.utility} · {resolvedValues[token.variable] || 'unresolved'}
							</p>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</Story>
