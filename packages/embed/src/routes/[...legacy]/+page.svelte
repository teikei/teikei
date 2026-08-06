<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	$effect(() => {
		void goto(data.redirectTarget, { replaceState: true, noScroll: true });
	});
</script>

<p class="sr-only">Redirecting...</p>
