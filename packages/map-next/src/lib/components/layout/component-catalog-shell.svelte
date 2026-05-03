<script lang="ts">
	import type { Snippet } from 'svelte';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';

	interface Props {
		title: string;
		description: string;
		themeId?: string;
		children: Snippet;
	}

	let { title, description, themeId, children }: Props = $props();
</script>

<main
	data-theme={themeId}
	class="absolute inset-0 z-50 overflow-auto bg-background/95 text-foreground backdrop-blur"
>
	<div class="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-6 py-8">
		<header class="flex flex-col gap-2">
			<Heading level={1}>{title}</Heading>
			<Paragraph>{description}</Paragraph>
		</header>

		{@render children()}
	</div>
</main>
