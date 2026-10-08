<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { confirmUser, reactivateUser } from '$lib/api/auth';
	import { parseHashRoute } from '$lib/utils/routes';
	import { StatusBanner } from '$lib/components/display';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveApiErrorMessage } from '$lib/utils/api-error';

	interface TokenFeedback {
		kind: 'success' | 'error';
		message: string;
	}

	let tokenFeedback: TokenFeedback | null = $state(null);
	let tokenFlowRequestKey: string | null = $state(null);
	let isTokenFlowPending = $state(false);

	function getTokenParam(
		name: 'confirmation_token' | 'reactivation_token' | 'user_id'
	): string | null {
		const searchValue = page.url.searchParams.get(name);
		if (searchValue) {
			return searchValue;
		}

		const hashQuery = parseHashRoute(page.url.hash).query;
		return hashQuery.get(name);
	}

	async function clearTokenQueryParamsFromUrl() {
		const nextSearch = new SvelteURLSearchParams(page.url.searchParams);
		nextSearch.delete('confirmation_token');
		nextSearch.delete('reactivation_token');
		nextSearch.delete('user_id');

		const parsedHashRoute = parseHashRoute(page.url.hash);
		const nextHashQuery = new SvelteURLSearchParams(parsedHashRoute.query);
		nextHashQuery.delete('confirmation_token');
		nextHashQuery.delete('reactivation_token');
		nextHashQuery.delete('user_id');

		const nextHash = `#${parsedHashRoute.path}${nextHashQuery.size ? `?${nextHashQuery.toString()}` : ''}`;
		const nextUrl = `${page.url.pathname}${nextSearch.size ? `?${nextSearch.toString()}` : ''}${nextHash}`;

		await goto(nextUrl, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function dismissTokenFeedback() {
		tokenFeedback = null;
	}

	async function handleSignupVerification(confirmationToken: string) {
		const response = await confirmUser({ confirmationToken });
		if (!response.isVerified) {
			throw new Error(m.map_token_verification_error());
		}
		tokenFeedback = { kind: 'success', message: m.map_token_verification_success() };
	}

	async function handleReactivation(userId: string, token: string) {
		await reactivateUser({ id: userId, token });
		tokenFeedback = { kind: 'success', message: m.map_token_reactivation_success() };
	}

	$effect(() => {
		const confirmationToken = getTokenParam('confirmation_token');
		const reactivationToken = getTokenParam('reactivation_token');
		const userId = getTokenParam('user_id');

		const requestKey = confirmationToken
			? `confirm:${confirmationToken}`
			: reactivationToken && userId
				? `reactivate:${userId}:${reactivationToken}`
				: null;

		if (!requestKey) {
			tokenFlowRequestKey = null;
			return;
		}

		if (requestKey === tokenFlowRequestKey || isTokenFlowPending) {
			return;
		}

		tokenFlowRequestKey = requestKey;
		isTokenFlowPending = true;

		void (async () => {
			try {
				if (confirmationToken) {
					await handleSignupVerification(confirmationToken);
				} else if (reactivationToken && userId) {
					await handleReactivation(userId, reactivationToken);
				}
			} catch (error) {
				const message = resolveApiErrorMessage(
					error,
					confirmationToken ? m.map_token_verification_error() : m.map_token_reactivation_error()
				);
				tokenFeedback = { kind: 'error', message };
			} finally {
				isTokenFlowPending = false;
				await clearTokenQueryParamsFromUrl();
			}
		})();
	});
</script>

{#if tokenFeedback}
	<div
		class="absolute inset-x-3 top-2 z-[var(--z-map-controls)] mx-auto w-fit max-w-xl"
		data-testid="token-feedback-banner"
	>
		<StatusBanner
			status={tokenFeedback.kind}
			message={tokenFeedback.message}
			ondismiss={dismissTokenFeedback}
		/>
	</div>
{/if}
