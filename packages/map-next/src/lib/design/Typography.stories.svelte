<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design System/Tokens/Typography',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component:
						'Font-family tokens only. Sizes, weights, and the heading scale are encoded in the Heading and Paragraph components — see their stories rather than duplicating them here. `--font-heading` is a deliberate extension point: it equals `--font-sans` today but lets a client theme give headings a distinct face.'
				}
			}
		}
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface FontToken {
		name: string;
		variable: string;
		fontClass: string;
		usage: string;
	}

	const fontTokens: FontToken[] = [
		{
			name: 'Sans',
			variable: '--font-sans',
			fontClass: 'font-sans',
			usage: 'Body copy, UI text, and the default for everything'
		},
		{
			name: 'Heading',
			variable: '--font-heading',
			fontClass: 'font-heading',
			usage: 'Headings; equals Sans by default, overridable per client theme'
		},
		{
			name: 'Serif',
			variable: '--font-serif',
			fontClass: 'font-serif',
			usage: 'Unused — the serif accent was dropped app-wide; token stays defined but unreferenced'
		}
	];

	let rootElement: HTMLDivElement;
	let resolvedValues = $state<Record<string, string>>({});

	function readFontValues() {
		if (!rootElement) {
			return;
		}

		const styles = getComputedStyle(rootElement);
		resolvedValues = Object.fromEntries(
			fontTokens.map((token) => [token.variable, styles.getPropertyValue(token.variable).trim()])
		);
	}

	onMount(() => {
		readFontValues();

		const observer = new MutationObserver(readFontValues);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => observer.disconnect();
	});
</script>

<Story name="Fonts">
	<div bind:this={rootElement} class="min-h-screen bg-background p-8 text-foreground">
		<div class="mx-auto flex max-w-4xl flex-col gap-10">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">Typography Tokens</h1>
				<p class="max-w-3xl text-sm text-muted-foreground">
					These are the only typography values that are tokenized. For sizes, weights, and the
					heading scale, use the
					<strong>Heading</strong> and <strong>Paragraph</strong> components and their stories.
				</p>
			</header>

			<div class="flex flex-col gap-4">
				{#each fontTokens as token (token.variable)}
					<article class="flex flex-col gap-3 rounded-md border bg-card p-5 text-card-foreground">
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<h2 class="text-lg font-semibold">{token.name}</h2>
							<code class="text-xs text-muted-foreground">{token.variable}</code>
						</div>
						<p class="{token.fontClass} text-3xl">Community supported agriculture</p>
						<p class="{token.fontClass} text-base text-muted-foreground">
							The quick brown fox jumps over the lazy dog · 0123456789
						</p>
						<p class="text-xs text-muted-foreground">{token.usage}</p>
						<p class="truncate text-xs text-muted-foreground">
							{resolvedValues[token.variable] || 'unresolved'}
						</p>
					</article>
				{/each}
			</div>
		</div>
	</div>
</Story>
