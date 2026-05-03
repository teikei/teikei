<script lang="ts">
	import type { Snippet } from 'svelte';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';

	interface Props {
		title: string;
		description?: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<section class="flex flex-col gap-4 rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
	<header class="flex flex-col gap-1">
		<Heading level={2}>{title}</Heading>
		{#if description}
			<Paragraph>{description}</Paragraph>
		{/if}
	</header>

	<div class="flex flex-col gap-4">
		{@render children()}
	</div>
</section>
