<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design System/Tokens/Z-Index',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component:
						'The map (MapLibre) renders its own stacking context, so app chrome layered over the map needs explicit, high z-index values. These are centralized as tokens in `layout.css` instead of scattered magic numbers. They are theme-independent. Reference them with `z-[var(--z-map-overlay)]`; standard low utilities (z-10/z-20) are fine for purely local stacking.'
				}
			}
		}
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface ZIndexToken {
		name: string;
		variable: string;
		usage: string;
	}

	const zIndexTokens: ZIndexToken[] = [
		{
			name: 'Map Sidebar',
			variable: '--z-map-sidebar',
			usage: 'The map sidebar shell'
		},
		{
			name: 'Map Overlay',
			variable: '--z-map-overlay',
			usage: 'Popovers, dropdowns, and search suggestions over the sidebar'
		},
		{
			name: 'Map Controls',
			variable: '--z-map-controls',
			usage: 'Floating controls bar over the map'
		}
	];

	let rootElement: HTMLDivElement;
	let resolvedValues = $state<Record<string, string>>({});

	function readZIndexValues() {
		if (!rootElement) {
			return;
		}

		const styles = getComputedStyle(rootElement);
		resolvedValues = Object.fromEntries(
			zIndexTokens.map((token) => [token.variable, styles.getPropertyValue(token.variable).trim()])
		);
	}

	onMount(readZIndexValues);
</script>

<Story name="Stacking">
	<div bind:this={rootElement} class="min-h-screen bg-background p-8 text-foreground">
		<div class="mx-auto flex max-w-4xl flex-col gap-10">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">Z-Index Tokens</h1>
				<p class="max-w-3xl text-sm text-muted-foreground">
					A small, coordinated scale for layering app chrome over the MapLibre canvas. Values are
					deliberately high to escape the map's stacking context. Use the token, never a raw number.
				</p>
			</header>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">Reference</h2>
				<div class="overflow-hidden rounded-md border">
					<table class="w-full text-left text-sm">
						<thead class="bg-muted text-muted-foreground">
							<tr>
								<th class="p-3 font-medium">Token</th>
								<th class="p-3 font-medium">Value</th>
								<th class="p-3 font-medium">Usage</th>
							</tr>
						</thead>
						<tbody>
							{#each zIndexTokens as token (token.variable)}
								<tr class="border-t">
									<td class="p-3"><code class="text-xs">{token.variable}</code></td>
									<td class="p-3 tabular-nums">{resolvedValues[token.variable] || 'unresolved'}</td>
									<td class="p-3 text-muted-foreground">{token.usage}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">Layering</h2>
				<p class="text-sm text-muted-foreground">
					Higher tokens render in front. Each card uses <code>z-[var(--z-map-…)]</code>.
				</p>
				<div class="relative h-56">
					<div
						class="absolute top-0 left-0 z-[var(--z-map-sidebar)] flex h-32 w-56 flex-col justify-end rounded-md border bg-sidebar p-3 shadow-xs"
					>
						<span class="text-sm font-medium">Map Sidebar</span>
						<code class="text-xs text-muted-foreground">--z-map-sidebar</code>
					</div>
					<div
						class="absolute top-10 left-16 z-[var(--z-map-overlay)] flex h-32 w-56 flex-col justify-end rounded-md border bg-card p-3 shadow-xs"
					>
						<span class="text-sm font-medium">Map Overlay</span>
						<code class="text-xs text-muted-foreground">--z-map-overlay</code>
					</div>
					<div
						class="absolute top-20 left-32 z-[var(--z-map-controls)] flex h-32 w-56 flex-col justify-end rounded-md border bg-primary p-3 text-primary-foreground shadow-xs"
					>
						<span class="text-sm font-medium">Map Controls</span>
						<code class="text-xs opacity-80">--z-map-controls</code>
					</div>
				</div>
			</section>
		</div>
	</div>
</Story>
