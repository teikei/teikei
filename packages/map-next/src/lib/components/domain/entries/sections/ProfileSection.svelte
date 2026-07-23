<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface ProfileSectionProps {
		/**
		 * Optional heading rendered above the section body. Read and edit variants
		 * of a section share this wrapper so their layout stays identical by
		 * construction (Feature 9 inline-edit parity).
		 */
		title?: string;
		/**
		 * Render the section body as a white shadcn card lifted off the cream
		 * panel. The title stays outside the card.
		 */
		card?: boolean;
		testId?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	import { Heading } from '$lib/components/typography';
	import * as Card from '$lib/components/ui/card';

	let { title, card = false, testId, children }: ProfileSectionProps = $props();
</script>

<!-- Section rhythm (8pt grid, DESIGN.md): 12px heading→body, 16px between the
     body's blocks (read-mode subgroups and edit-mode fields alike). -->
<section class="flex flex-col gap-3" data-testid={testId}>
	{#if title}
		<Heading level={5}>{title}</Heading>
	{/if}
	{#if card}
		<Card.Root size="sm" class="rounded-md">
			<Card.Content class="flex flex-col gap-4">
				{@render children()}
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="flex flex-col gap-4">
			{@render children()}
		</div>
	{/if}
</section>
