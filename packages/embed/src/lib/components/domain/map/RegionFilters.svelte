<script module lang="ts">
	// Sentinel for the "all regions" item — Select needs a non-empty value, the
	// caller only ever sees `null`.
	const ALL_REGIONS_VALUE = '__all_regions__';
</script>

<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { RegionOption } from '$lib/utils/regions';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		countryOptions: RegionOption[];
		stateOptions: RegionOption[];
		selectedCountry: string;
		selectedState: string | null;
		onCountrySelect: (countryCode: string) => void;
		onStateSelect?: (stateCode: string | null) => void;
	}

	let {
		countryOptions,
		stateOptions,
		selectedCountry,
		selectedState,
		onCountrySelect,
		onStateSelect
	}: Props = $props();

	const stateSelectValue = $derived(selectedState ?? ALL_REGIONS_VALUE);
	const selectedCountryLabel = $derived(
		countryOptions.find((option) => option.value === selectedCountry)?.label ??
			m.map_sidebar_country_label()
	);
	const selectedStateLabel = $derived.by(() => {
		if (stateOptions.length === 0) {
			return m.map_sidebar_no_regions_available();
		}

		if (!selectedState) {
			return m.map_sidebar_all_regions();
		}

		return stateOptions.find((option) => option.value === selectedState)?.label ?? selectedState;
	});
</script>

<div class="mt-2 grid grid-cols-2 gap-2">
	<div class="flex min-w-0 flex-col gap-1">
		<span class="px-1 text-xs text-muted-foreground">{m.map_sidebar_country_label()}</span>
		<Select.Root type="single" value={selectedCountry} onValueChange={onCountrySelect}>
			<!-- Shell-level control: keep the prominent --control-border and the generous
			     shell radius (rounded-2xl), not the softer/less-rounded form defaults. -->
			<Select.Trigger
				id="country-browse-select"
				class="w-full cursor-pointer rounded-2xl border-control-border"
			>
				{selectedCountryLabel}
			</Select.Trigger>
			<Select.Content class="z-[var(--z-map-overlay)]">
				<Select.Group>
					{#each countryOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>
	<div class="flex min-w-0 flex-col gap-1">
		<span class="px-1 text-xs text-muted-foreground">{m.map_sidebar_region_label()}</span>
		<Select.Root
			type="single"
			value={stateSelectValue}
			onValueChange={(value) => onStateSelect?.(value === ALL_REGIONS_VALUE ? null : value)}
			disabled={stateOptions.length === 0}
		>
			<!-- Shell-level control: keep the prominent --control-border and the generous
			     shell radius (rounded-2xl), not the softer/less-rounded form defaults. -->
			<Select.Trigger
				id="region-browse-select"
				class="w-full cursor-pointer rounded-2xl border-control-border"
			>
				{selectedStateLabel}
			</Select.Trigger>
			<Select.Content class="z-[var(--z-map-overlay)]">
				<Select.Group>
					<Select.Item value={ALL_REGIONS_VALUE} label={m.map_sidebar_all_regions()} />
					{#each stateOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>
</div>
