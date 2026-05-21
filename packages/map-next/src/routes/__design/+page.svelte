<script lang="ts">
	import ComponentCatalogSection from './ComponentCatalogSection.svelte';
	import ComponentCatalogShell from './ComponentCatalogShell.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import Heading from '$lib/components/typography/Heading.svelte';
	import Paragraph from '$lib/components/typography/Paragraph.svelte';
	import { AppButton } from '$lib/components/actions';
	import { Separator } from '$lib/components/ui/separator';
	import { defaultDesignThemeId, designThemes, type DesignThemeId } from '$lib/design/themes';

	const colors = ['background', 'foreground', 'primary', 'secondary', 'accent', 'border'];
	const buttonVariants = ['default', 'outline'] as const;
	const themeOptions = Object.values(designThemes);

	let selectedThemeId: DesignThemeId = $state(defaultDesignThemeId);
	let email = $state('');
</script>

<ComponentCatalogShell
	title="Teikei Design System"
	description="Design foundations and UI components overview."
	themeId={selectedThemeId}
>
	<ComponentCatalogSection title="Colors" description="Main color palette in the selected theme.">
		<div class="flex max-w-xs flex-col gap-1">
			<label class="px-1 text-xs text-muted-foreground" for="design-theme-select">Theme</label>
			<select
				id="design-theme-select"
				class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
				value={selectedThemeId}
				onchange={(event) => {
					selectedThemeId = event.currentTarget.value as DesignThemeId;
				}}
			>
				{#each themeOptions as theme (theme.id)}
					<option value={theme.id}>{theme.label}</option>
				{/each}
			</select>
		</div>

		<div class="grid gap-2 sm:grid-cols-3">
			{#each colors as token (token)}
				<div class="flex flex-col gap-1">
					<div
						class="h-10 rounded-md border"
						style={`background: var(--${token}); border-color: var(--border);`}
					></div>
					<span class="text-xs text-muted-foreground">{token}</span>
				</div>
			{/each}
		</div>
	</ComponentCatalogSection>

	<ComponentCatalogSection title="Typography">
		<div class="flex flex-col gap-3">
			<Heading level={1}>Heading level 1</Heading>
			<Heading level={2}>Heading level 2</Heading>
			<Heading level={3}>Heading level 3</Heading>
			<Paragraph>Paragraph text for introductory content in panels and detail views.</Paragraph>
			<Paragraph>Default paragraph text for body copy.</Paragraph>
		</div>
	</ComponentCatalogSection>

	<ComponentCatalogSection title="Buttons">
		<div class="flex flex-wrap gap-3">
			{#each buttonVariants as variant (variant)}
				<AppButton {variant}>{variant}</AppButton>
			{/each}
		</div>
	</ComponentCatalogSection>

	<ComponentCatalogSection title="Forms">
		<div class="max-w-sm">
			<FormInput id="catalog-email" label="Email" type="email" bind:value={email} />
			<Separator class="my-4" />
			<FormInput
				id="catalog-invalid-email"
				label="Email with error"
				type="email"
				value="invalid"
				error="Please enter a valid email address."
			/>
		</div>
	</ComponentCatalogSection>
</ComponentCatalogShell>
