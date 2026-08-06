<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { getPortalContainer } from '$lib/utils/portal.js';

	let { to, ...restProps }: SelectPrimitive.PortalProps = $props();

	// Use shadow DOM portal container if available, otherwise fall back to provided `to` or default
	const portalTarget = $derived(to ?? getPortalContainer());
</script>

<SelectPrimitive.Portal to={portalTarget} {...restProps} />
