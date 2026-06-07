<script lang="ts" module>
	import type { CommonFormState } from '$lib/utils/editor-form';
	import * as m from '$lib/paraglide/messages.js';

	type AddressFieldKey = Exclude<keyof CommonFormState, 'name' | 'url' | 'description'>;

	interface AddressFieldConfig {
		key: AddressFieldKey;
		idSuffix: string;
		testIdSuffix?: string;
		label: () => string;
	}

	// City through longitude, in the order shared by every entry editor.
	const ADDRESS_FIELDS: readonly AddressFieldConfig[] = [
		{ key: 'city', idSuffix: 'city', testIdSuffix: 'city', label: m.editor_field_city },
		{ key: 'postalcode', idSuffix: 'postalcode', label: m.editor_field_postalcode },
		{ key: 'country', idSuffix: 'country', label: m.editor_field_country },
		{ key: 'state', idSuffix: 'region', label: m.editor_field_region },
		{ key: 'address', idSuffix: 'address', label: m.editor_field_address },
		{ key: 'street', idSuffix: 'street', label: m.editor_field_street },
		{ key: 'housenumber', idSuffix: 'housenumber', label: m.editor_field_housenumber },
		{
			key: 'latitude',
			idSuffix: 'latitude',
			testIdSuffix: 'latitude',
			label: m.editor_field_latitude
		},
		{
			key: 'longitude',
			idSuffix: 'longitude',
			testIdSuffix: 'longitude',
			label: m.editor_field_longitude
		}
	];

	export interface AddressFieldsProps {
		fields: CommonFormState;
		idPrefix: string;
		testIdPrefix: string;
		onFieldChange: (field: keyof CommonFormState, value: string) => void;
	}
</script>

<script lang="ts">
	import FormInput from './FormInput.svelte';

	let { fields, idPrefix, testIdPrefix, onFieldChange }: AddressFieldsProps = $props();
</script>

{#each ADDRESS_FIELDS as field (field.key)}
	<FormInput
		id={`${idPrefix}-${field.idSuffix}`}
		data-testid={field.testIdSuffix ? `${testIdPrefix}-${field.testIdSuffix}` : undefined}
		label={field.label()}
		value={fields[field.key]}
		oninput={(event) => onFieldChange(field.key, event.currentTarget.value)}
	/>
{/each}
