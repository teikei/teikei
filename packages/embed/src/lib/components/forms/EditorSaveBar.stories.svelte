<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EditorSaveBar from './EditorSaveBar.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Forms/EditorSaveBar',
		component: EditorSaveBar,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			isSaving: false,
			sectionErrors: [],
			onCancel: () => {}
		}
	});
</script>

<Story name="Default" />

<Story name="Saving" args={{ isSaving: true }} />

<Story name="With Section Errors" args={{ sectionErrors: ['Adresse', 'Kontakt'] }} />
