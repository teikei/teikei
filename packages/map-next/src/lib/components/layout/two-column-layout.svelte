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
	<div class="relative hidden flex-col justify-start p-16 lg:flex">
		<div class="relative z-10 mx-auto max-w-xl space-y-10">
			{#if leftColumn}
				<div class="space-y-8">
					{@render leftColumn()}
				</div>
			{/if}
		</div>
	</div>
	<!-- Right Column - Form -->
	<div class="relative flex flex-col items-center justify-start bg-[#eaf1ef] p-16">
		{#if rightColumn}
			<div class="w-full max-w-md space-y-8">
				{@render rightColumn()}
			</div>
		{:else if children}
			<div class="w-full max-w-md space-y-8">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
