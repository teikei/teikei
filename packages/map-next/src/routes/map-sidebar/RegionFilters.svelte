<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { RegionOption } from '$lib/utils/regions';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		countryOptions: RegionOption[];
		stateOptions: RegionOption[];
		selectedCountry: string;
		stateSelectValue: string;
		selectedCountryLabel: string;
		selectedStateLabel: string;
		allRegionsValue: string;
		onCountrySelect: (countryCode: string) => void;
		onStateSelect: (stateCode: string) => void;
	}

	let {
		countryOptions,
		stateOptions,
		selectedCountry,
		stateSelectValue,
		selectedCountryLabel,
		selectedStateLabel,
		allRegionsValue,
		onCountrySelect,
		onStateSelect
	}: Props = $props();
</script>

<div class="mt-2 grid grid-cols-2 gap-2">
	<div class="flex min-w-0 flex-col gap-1">
		<span class="px-1 text-xs text-muted-foreground">{m.map_sidebar_country_label()}</span>
		<Select.Root type="single" value={selectedCountry} onValueChange={onCountrySelect}>
			<Select.Trigger id="country-browse-select" class="w-full ">
				{selectedCountryLabel}
			</Select.Trigger>
			<Select.Content class="z-[1200]">
				{#each countryOptions as option (option.value)}
					<Select.Item value={option.value} label={option.label} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
	<div class="flex min-w-0 flex-col gap-1">
		<span class="px-1 text-xs text-muted-foreground">{m.map_sidebar_region_label()}</span>
		<Select.Root
			type="single"
			value={stateSelectValue}
			onValueChange={onStateSelect}
			disabled={stateOptions.length === 0}
		>
			<Select.Trigger id="region-browse-select" class="w-full">
				{selectedStateLabel}
			</Select.Trigger>
			<Select.Content class="z-[1200]">
				<Select.Item value={allRegionsValue} label={m.map_sidebar_all_regions()} />
				{#each stateOptions as option (option.value)}
					<Select.Item value={option.value} label={option.label} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
</div>
