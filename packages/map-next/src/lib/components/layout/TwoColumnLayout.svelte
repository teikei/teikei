<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/tailwind.js';

	interface Props {
		leftColumn?: Snippet;
		rightColumn?: Snippet;
		children?: Snippet;
		class?: string;
	}

	let { leftColumn, rightColumn, children, class: className }: Props = $props();
</script>

<div class={cn('grid h-full lg:grid-cols-2', className ? className : 'min-h-screen')}>
	<!-- Left Column - Information (hidden on mobile, visible on lg+) -->
	<div class="relative hidden flex-col justify-start p-8 lg:flex lg:p-16">
		<div class="relative z-10 mx-auto flex max-w-xl flex-col gap-10">
			{#if leftColumn}
				<div class="flex flex-col gap-8">
					{@render leftColumn()}
				</div>
			{/if}
		</div>
	</div>
	<!-- Right Column - Form -->
	<div
		class="relative flex styled-scrollbar min-h-0 flex-col items-center justify-start overflow-y-auto bg-auth-panel p-4 sm:p-6 lg:p-16"
	>
		{#if rightColumn}
			<div class="flex w-full max-w-md flex-col gap-6 sm:gap-8">
				{@render rightColumn()}
			</div>
		{:else if children}
			<div class="flex w-full max-w-md flex-col gap-6 sm:gap-8">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
