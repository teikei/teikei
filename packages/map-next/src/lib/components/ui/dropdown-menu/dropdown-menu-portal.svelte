<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { getPortalContainer } from '$lib/utils/portal.js';

	let { to, ...restProps }: DropdownMenuPrimitive.PortalProps = $props();

	// Use shadow DOM portal container if available, otherwise fall back to provided `to` or default
	const portalTarget = $derived(to ?? getPortalContainer());
</script>

<DropdownMenuPrimitive.Portal to={portalTarget} {...restProps} />
