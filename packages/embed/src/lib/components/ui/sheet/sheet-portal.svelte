<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import { getPortalContainer } from '$lib/utils/portal.js';

	let { to, ...restProps }: SheetPrimitive.PortalProps = $props();

	// Use shadow DOM portal container if available, otherwise fall back to provided `to` or default
	const portalTarget = $derived(to ?? getPortalContainer());
</script>

<SheetPrimitive.Portal to={portalTarget} {...restProps} />
