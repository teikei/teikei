<script lang="ts">
	import { AppButton } from '$lib/components/actions';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		isSaving: boolean;
		/** Translated titles of sections that currently contain validation errors. */
		sectionErrors?: string[];
		/** Prefix for the cancel/save test ids (e.g. `depot-editor` in the depot editor). */
		testIdPrefix?: string;
		onCancel: () => void;
	}

	let { isSaving, sectionErrors = [], testIdPrefix = 'entry-editor', onCancel }: Props = $props();
</script>

<div
	class="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-separator bg-sidebar/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80"
>
	{#if sectionErrors.length > 0}
		<p
			role="alert"
			data-testid="editor-error-summary"
			class="mr-auto w-full text-sm text-destructive sm:w-auto"
		>
			{m.editor_error_summary({ sections: sectionErrors.join(', ') })}
		</p>
	{/if}
	<AppButton type="button" variant="outline" data-testid="{testIdPrefix}-cancel" onclick={onCancel}>
		{m.editor_cancel()}
	</AppButton>
	<AppButton type="submit" data-testid="{testIdPrefix}-save" disabled={isSaving}>
		{#if isSaving}
			<Spinner data-icon="inline-start" />
		{/if}
		{isSaving ? m.editor_saving() : m.editor_save()}
	</AppButton>
</div>
