<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
</script>

<!-- Placeholder mirroring the profile layout (header block, action row, content
     sections) shown while a detail or editor route's data loads. -->
<div class="flex flex-col gap-6 p-4" data-testid="profile-skeleton" aria-hidden="true">
	<div class="flex items-start gap-4">
		<Skeleton class="size-12 shrink-0 rounded-full" />
		<div class="flex min-w-0 flex-1 flex-col gap-2">
			<Skeleton class="h-5 w-2/3" />
			<Skeleton class="h-4 w-1/3" />
		</div>
	</div>
	<div class="flex gap-2">
		<Skeleton class="h-9 w-28 rounded-xl" />
		<Skeleton class="h-9 w-20 rounded-xl" />
	</div>
	{#each [0, 1, 2] as section (section)}
		<Separator class="bg-separator" />
		<div class="flex flex-col gap-2">
			<Skeleton class="h-4 w-1/4" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-5/6" />
		</div>
	{/each}
</div>
