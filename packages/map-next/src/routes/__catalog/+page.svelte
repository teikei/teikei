<script lang="ts">
	import ComponentCatalogSection from '$lib/components/layout/component-catalog-section.svelte';
	import ComponentCatalogShell from '$lib/components/layout/component-catalog-shell.svelte';
	import FormInput from '$lib/components/shared/forms/FormInput.svelte';
	import Heading from '$lib/components/shared/typography/Heading.svelte';
	import Paragraph from '$lib/components/shared/typography/Paragraph.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { designThemes } from '$lib/design/themes';

	const tokenExamples = ['background', 'foreground', 'primary', 'secondary', 'accent', 'border'];
	const buttonVariants = ['default', 'secondary', 'outline', 'ghost', 'link'] as const;

	let email = $state('');
</script>

<ComponentCatalogShell
	title="Component Catalog"
	description="Internal examples for reusable theme tokens and design-system components."
>
	<ComponentCatalogSection
		title="Themes"
		description="Token sets available in the current bundle."
	>
		<div class="grid gap-4 md:grid-cols-2">
			{#each Object.values(designThemes) as theme}
				<div class="flex flex-col gap-3 rounded-md border bg-background p-4" data-theme={theme.id}>
					<div>
						<Heading level={3}>{theme.label}</Heading>
						<Paragraph>{theme.description}</Paragraph>
					</div>
					<div class="grid grid-cols-3 gap-2">
						{#each tokenExamples as token}
							<div class="flex flex-col gap-1">
								<div
									class="h-10 rounded-md border"
									style={`background: var(--${token}); border-color: var(--border);`}
								></div>
								<span class="text-xs text-muted-foreground">{token}</span>
							</div>
						{/each}
					</div>
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
			{#each buttonVariants as variant}
				<Button {variant}>{variant}</Button>
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
