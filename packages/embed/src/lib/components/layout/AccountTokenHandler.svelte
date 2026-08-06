<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { confirmUser, reactivateUser } from '$lib/api/auth';
	import { parseHashRoute } from '$lib/utils/routes';
	import { AppButton } from '$lib/components/actions';
	import * as Alert from '$lib/components/ui/alert';
	import { toastSuccess, toastError } from '$lib/utils/toast';
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
		const message = m.map_token_verification_success();
		tokenFeedback = { kind: 'success', message };
		toastSuccess(message);
	}

	async function handleReactivation(userId: string, token: string) {
		await reactivateUser({ id: userId, token });
		const message = m.map_token_reactivation_success();
		tokenFeedback = { kind: 'success', message };
		toastSuccess(message);
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
				toastError(message);
			} finally {
				isTokenFlowPending = false;
				await clearTokenQueryParamsFromUrl();
			}
		})();
	});
</script>

{#if tokenFeedback}
	<div
		class="pointer-events-auto absolute top-2 left-1/2 z-[var(--z-map-controls)] w-full max-w-xl -translate-x-1/2 px-3"
		data-testid="token-feedback-banner"
	>
		<Alert.Root
			variant={tokenFeedback.kind === 'error' ? 'destructive' : 'default'}
			class={tokenFeedback.kind === 'success'
				? 'border-success-border bg-success-muted text-success-foreground'
				: ''}
		>
			<Alert.Description>{tokenFeedback.message}</Alert.Description>
			<div class="col-start-2 mt-2 flex justify-end">
				<AppButton
					type="button"
					variant="outline"
					data-testid="token-feedback-dismiss"
					onclick={dismissTokenFeedback}
				>
					{m.map_token_feedback_dismiss()}
				</AppButton>
			</div>
		</Alert.Root>
	</div>
{/if}
