<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface ProfileSectionProps {
		/**
		 * Optional heading rendered above the section body. Read and edit variants
		 * of a section share this wrapper so their layout stays identical by
		 * construction (Feature 9 inline-edit parity).
		 */
		title?: string;
		testId?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	let { title, testId, children }: ProfileSectionProps = $props();
</script>

<section class="flex flex-col gap-2" data-testid={testId}>
	{#if title}
		<h4 class="text-sm font-semibold">{title}</h4>
	{/if}
	{@render children()}
</section>
