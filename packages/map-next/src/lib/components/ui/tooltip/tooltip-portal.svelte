<script lang="ts">
	import { getPortalContainer } from '$lib/utils/portal';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	let { to, ...restProps }: TooltipPrimitive.PortalProps = $props();

	// Use shadow DOM portal container if available, otherwise fall back to provided `to` or default
	const portalTarget = $derived(to ?? getPortalContainer());
</script>

<TooltipPrimitive.Portal {...restProps} to={portalTarget} />
