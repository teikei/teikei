<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Search } from 'lucide-svelte';

	let sidebarOpen = $state(false);
	let searchValue = $state('');

	function handleFocus() {
		sidebarOpen = true;
	}

	function handleBlur() {
		sidebarOpen = false;
	}
</script>

<div class="pointer-events-auto absolute top-2.5 left-2.5 z-20 shadow">
	<Sidebar.Provider bind:open={sidebarOpen} class="min-h-0">
		<Sidebar.Root
			variant="floating"
			collapsible="none"
			class="max-h-[400px] w-[400px] rounded-lg border border-sidebar-border"
		>
			<Sidebar.Header>
				<div class="relative">
					<Search
						class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Sidebar.Input
						placeholder="Search..."
						bind:value={searchValue}
						onfocus={handleFocus}
						onblur={handleBlur}
						class="pl-8"
					/>
				</div>
			</Sidebar.Header>
			{#if sidebarOpen}
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Results</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<p class="px-2 text-sm text-muted-foreground">Search results will appear here...</p>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
			{/if}
		</Sidebar.Root>
	</Sidebar.Provider>
</div>
