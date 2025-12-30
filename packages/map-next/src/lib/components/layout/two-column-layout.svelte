<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		leftColumn?: Snippet;
		rightColumn?: Snippet;
		children?: Snippet;
	}

	let { leftColumn, rightColumn, children }: Props = $props();
</script>

<div class="grid min-h-screen lg:grid-cols-2">
	<!-- Left Column - Information (hidden on mobile, visible on lg+) -->
	<div class="relative hidden flex-col justify-start overflow-hidden p-16 lg:flex">
		<div class="relative z-10 mx-auto max-w-xl space-y-10">
			{#if leftColumn}
				{@render leftColumn()}
			{/if}
		</div>
	</div>
	<!-- Right Column - Form -->
	<div class="relative flex flex-col items-center justify-start overflow-hidden bg-[#eaf1ef] p-16">
		{#if rightColumn}
			{@render rightColumn()}
		{:else if children}
			{@render children()}
		{/if}
	</div>
</div>
