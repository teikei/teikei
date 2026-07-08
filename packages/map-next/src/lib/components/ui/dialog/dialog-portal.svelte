<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { getPortalContainer } from '$lib/utils/portal.js';

	let { to, ...restProps }: DialogPrimitive.PortalProps = $props();

	// Use shadow DOM portal container if available, otherwise fall back to provided `to` or default
	const portalTarget = $derived(to ?? getPortalContainer());
</script>

<DialogPrimitive.Portal to={portalTarget} {...restProps} />
