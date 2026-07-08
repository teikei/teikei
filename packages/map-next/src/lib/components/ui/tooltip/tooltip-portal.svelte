<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { getPortalContainer } from '$lib/utils/portal.js';

	let { to, ...restProps }: TooltipPrimitive.PortalProps = $props();

	// Use shadow DOM portal container if available, otherwise fall back to provided `to` or default
	const portalTarget = $derived(to ?? getPortalContainer());
</script>

<TooltipPrimitive.Portal to={portalTarget} {...restProps} />
