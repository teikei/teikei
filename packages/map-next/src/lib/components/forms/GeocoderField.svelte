<script lang="ts" module>
	import type { CommonFormState } from '$lib/utils/editor-form';
	import type { EntryType } from '$lib/types/entries';

	export interface GeocoderFieldProps {
		id: string;
		label: string;
		testIdPrefix?: string;
		/** Determines which marker icon the preview map shows. */
		markerType: EntryType;
		/** The shared address/coordinate subset of the bound form model. */
		fields: CommonFormState;
		onFieldChange: (field: keyof CommonFormState, value: string) => void;
		/**
		 * Validation message for the combined address selection. Pass the first
		 * of `$errors.city ?? $errors.latitude ?? $errors.longitude` — all three
		 * only ever change together via this field's own selection/clear.
		 */
		error?: string | string[];
		/** Marks the field as required: appends a visible "*" to the label and sets `aria-required`. */
		required?: boolean;
	}

	const MIN_SEARCH_CHARS = 2;
	const SEARCH_DEBOUNCE_MS = 300;

	/** Address + coordinate fields the geocoder selection writes together. */
	const ADDRESS_FIELD_KEYS = [
		'address',
		'street',
		'housenumber',
		'postalcode',
		'city',
		'state',
		'country',
		'latitude',
		'longitude'
	] as const satisfies readonly (keyof CommonFormState)[];

	function addressLabel(fields: CommonFormState): string {
		return fields.address ? [fields.address, fields.city].filter(Boolean).join(', ') : fields.city;
	}
</script>

<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import * as InputGroup from '$lib/components/ui/input-group';
	import XIcon from '@lucide/svelte/icons/x';
	import GeocoderPreviewMap from './GeocoderPreviewMap.svelte';
	import {
		geocodeLocationId,
		getAutocompleteSuggestions,
		type AutocompleteSuggestion
	} from '$lib/api/discovery';
	import config from '$lib/config/app-configuration';
	import { createDebouncedCallback } from '$lib/utils/debounce';
	import { translateErrors } from '$lib/utils/translate-error';
	import * as m from '$lib/paraglide/messages.js';
	import { dev } from '$app/environment';

	let {
		id,
		label,
		testIdPrefix,
		markerType,
		fields,
		onFieldChange,
		error,
		required = false
	}: GeocoderFieldProps = $props();

	// `null` means "not actively typing": the input mirrors the address/city
	// derived from the bound fields. Typing sets a local query that only
	// overwrites the stored location once a suggestion is selected (typed-but-
	// unselected text must never count as a location, per legacy behavior).
	let query = $state<string | null>(null);
	let suggestions: AutocompleteSuggestion[] = $state([]);
	let isLoading = $state(false);
	let latestRequestId = 0;
	let geocodeFailed = $state(false);

	const errorMessage = $derived(
		geocodeFailed ? m.editor_geocoder_resolve_error() : translateErrors(error)
	);
	const hasError = $derived(!!error || geocodeFailed);
	const inputValue = $derived(query ?? addressLabel(fields));
	const showSuggestions = $derived(query !== null && query.trim().length >= MIN_SEARCH_CHARS);
	const latitude = $derived(Number(fields.latitude));
	const longitude = $derived(Number(fields.longitude));
	const hasCoordinates = $derived(
		fields.latitude.trim().length > 0 &&
			fields.longitude.trim().length > 0 &&
			Number.isFinite(latitude) &&
			Number.isFinite(longitude)
	);
	const testId = $derived(testIdPrefix ? `${testIdPrefix}-geocoder` : 'geocoder');

	function clearAddressFields() {
		for (const field of ADDRESS_FIELD_KEYS) {
			onFieldChange(field, '');
		}
	}

	async function loadSuggestions(text: string) {
		const trimmed = text.trim();
		if (trimmed.length < MIN_SEARCH_CHARS) {
			suggestions = [];
			isLoading = false;
			return;
		}

		const requestId = ++latestRequestId;
		isLoading = true;

		try {
			const result = await getAutocompleteSuggestions({
				text: trimmed,
				locale: config.displayLocale,
				withEntries: false
			});

			if (requestId !== latestRequestId) {
				return;
			}
			suggestions = result;
		} catch (fetchError) {
			if (requestId !== latestRequestId) {
				return;
			}
			suggestions = [];
			if (dev) {
				console.warn('Failed to fetch geocoder suggestions', fetchError);
			}
		} finally {
			if (requestId === latestRequestId) {
				isLoading = false;
			}
		}
	}

	const debouncedSearch = createDebouncedCallback(
		() => void loadSuggestions(query ?? ''),
		SEARCH_DEBOUNCE_MS
	);

	function handleInputValue(value: string) {
		geocodeFailed = false;
		query = value;
		// Invalidate any in-flight suggestion fetch or geocode lookup: its
		// result would otherwise land after this edit and silently overwrite
		// whatever the user does next.
		latestRequestId++;

		// Any edit — not just clearing the field entirely — invalidates a
		// previously selected/loaded location; typed-but-unselected text must
		// never keep submitting the old coordinates. `fields.city` is only ever
		// non-empty once a selection has actually been committed, so this is a
		// no-op once the fields are already cleared.
		if (fields.city) {
			clearAddressFields();
		}

		if (!value) {
			suggestions = [];
			isLoading = false;
			debouncedSearch.cancel();
			return;
		}

		if (value.trim().length < MIN_SEARCH_CHARS) {
			suggestions = [];
			debouncedSearch.cancel();
			return;
		}

		debouncedSearch.trigger();
	}

	function handleClear() {
		handleInputValue('');
	}

	async function handleSelect(suggestion: AutocompleteSuggestion) {
		suggestions = [];
		debouncedSearch.cancel();
		geocodeFailed = false;
		const requestId = ++latestRequestId;

		try {
			const result = await geocodeLocationId(suggestion.id);
			// The user may have typed, cleared, or selected something else while
			// this was in flight — a stale response must not overwrite that.
			if (requestId !== latestRequestId) {
				return;
			}

			const address = [result.street, result.houseNumber].filter(Boolean).join(' ').trim();

			onFieldChange('address', address);
			onFieldChange('street', result.street ?? '');
			onFieldChange('housenumber', result.houseNumber ?? '');
			onFieldChange('city', result.city ?? '');
			onFieldChange('state', result.state ?? '');
			onFieldChange('country', result.country ?? '');
			onFieldChange('postalcode', result.postalCode ?? '');
			onFieldChange('latitude', String(result.latitude));
			onFieldChange('longitude', String(result.longitude));

			query = null;
		} catch (geocodeError) {
			if (requestId !== latestRequestId) {
				return;
			}
			geocodeFailed = true;
			if (dev) {
				console.warn('Failed to geocode selected location', geocodeError);
			}
		}
	}
</script>

<Field.Field data-invalid={hasError}>
	<Field.Label for={id}
		>{label}{#if required}<span aria-hidden="true"> *</span>{/if}</Field.Label
	>
	<InputGroup.Root>
		<InputGroup.Input
			{id}
			data-testid={testId}
			placeholder={m.editor_geocoder_placeholder()}
			autocomplete="off"
			value={inputValue}
			aria-required={required || undefined}
			aria-invalid={hasError || undefined}
			oninput={(event) => handleInputValue(event.currentTarget.value)}
		/>
		{#if inputValue}
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button
					type="button"
					aria-label={m.editor_geocoder_clear()}
					onclick={handleClear}
				>
					<XIcon />
				</InputGroup.Button>
			</InputGroup.Addon>
		{/if}
		{#if showSuggestions}
			<div
				data-testid={`${testId}-suggestions`}
				class="absolute top-full right-0 left-0 z-[var(--z-map-overlay)] mt-1 overflow-hidden rounded-sm bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5"
			>
				{#if isLoading}
					<p class="px-3 py-2 text-sm text-muted-foreground">{m.editor_geocoder_loading()}</p>
				{:else if suggestions.length === 0}
					<p class="px-3 py-2 text-sm text-muted-foreground">{m.editor_geocoder_no_results()}</p>
				{:else}
					<ul class="max-h-56 overflow-y-auto py-1">
						{#each suggestions as suggestion (suggestion.id)}
							<li>
								<button
									type="button"
									class="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
									onclick={() => void handleSelect(suggestion)}
								>
									<span class="line-clamp-1">{suggestion.title}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</InputGroup.Root>
	<Field.Description>{m.editor_geocoder_help()}</Field.Description>
	<Field.Error>{errorMessage}</Field.Error>
	{#if hasCoordinates}
		<GeocoderPreviewMap {latitude} {longitude} {markerType} />
	{/if}
</Field.Field>
