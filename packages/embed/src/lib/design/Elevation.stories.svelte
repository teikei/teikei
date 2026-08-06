<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design System/Tokens/Elevation',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component:
						'Elevation is not tokenized separately — the app uses Tailwind\'s `shadow-*` scale, restricted to a three-step ladder so all floating chrome reads consistently (see DESIGN.md "Radius & Elevation"). MapLibre controls replicate `shadow-md` via scoped CSS in `Map.svelte`.'
				}
			}
		}
	});
</script>

<script lang="ts">
	interface ElevationStep {
		name: string;
		utility: string;
		shadowClass: string;
		usage: string;
	}

	const elevationSteps: ElevationStep[] = [
		{
			name: 'Resting',
			utility: 'shadow-md',
			shadowClass: 'shadow-md',
			usage: 'Cards, sidebar shell, bottom sheet, user-nav pills, map controls'
		},
		{
			name: 'Transient',
			utility: 'shadow-lg',
			shadowClass: 'shadow-lg',
			usage: 'Dropdowns, select and command popovers'
		},
		{
			name: 'Modal',
			utility: 'shadow-xl',
			shadowClass: 'shadow-xl',
			usage: 'Dialogs and sheets'
		}
	];
</script>

<Story name="Ladder">
	<div class="min-h-screen bg-sidebar p-8 text-foreground">
		<div class="mx-auto flex max-w-6xl flex-col gap-10">
			<header class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold">Elevation Ladder</h1>
				<p class="max-w-3xl text-sm text-muted-foreground">
					Three shadow steps, shown on the cream <code>bg-sidebar</code> panel the drawer uses, so
					white cards read as elevated on paper. Anything floating over the map uses exactly one of
					these; avoid other <code>shadow-*</code> values.
				</p>
			</header>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{#each elevationSteps as step (step.utility)}
					<article
						class="flex flex-col gap-3 rounded-4xl bg-card p-6 text-card-foreground ring-1 ring-foreground/5 {step.shadowClass}"
					>
						<h3 class="text-sm font-medium">{step.name}</h3>
						<p class="text-xs text-muted-foreground">{step.usage}</p>
						<code class="text-xs text-muted-foreground">{step.utility}</code>
					</article>
				{/each}
			</div>
		</div>
	</div>
</Story>
