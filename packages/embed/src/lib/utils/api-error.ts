import * as m from '$lib/paraglide/messages.js';
import { ApiError } from '$lib/types/errors';

/**
 * Maps the API's machine-readable codes to localized text. The API deliberately
 * knows nothing about this catalog, so a code it emits without an entry here
 * falls through to the status-class message rather than being rendered raw.
 */
const messageByCode: Record<string, () => string> = {
	INVALID_CREDENTIALS: m.errors_code_invalid_credentials,
	EMAIL_NOT_VERIFIED: m.errors_code_email_not_verified,
	PASSWORD_REQUIRED: m.errors_code_password_required,
	PASSWORD_INCORRECT: m.errors_code_password_incorrect,
	CURRENT_PASSWORD_INCORRECT: m.errors_code_current_password_incorrect,
	REACTIVATION_TOKEN_INVALID: m.errors_code_reactivation_token_invalid,
	RESET_TOKEN_INVALID: m.errors_code_reset_token_invalid,
	RESET_TOKEN_EXPIRED: m.errors_code_reset_token_expired,
	VERIFICATION_TOKEN_INVALID: m.errors_code_verification_token_invalid,
	VERIFICATION_TOKEN_EXPIRED: m.errors_code_verification_token_expired,
	USER_NOT_FOUND: m.errors_code_user_not_found,
	USER_NOT_VERIFIED: m.errors_code_user_not_verified,
	USER_ALREADY_VERIFIED: m.errors_code_user_already_verified,
	FORBIDDEN: m.errors_code_forbidden,
	FORBIDDEN_FIELDS: m.errors_code_forbidden_fields,
	RATE_LIMITED: m.errors_code_rate_limited,
	SERVER_ERROR: m.errors_code_server_error
};

function messageByStatus(status: number): (() => string) | undefined {
	switch (status) {
		case 401:
			return m.errors_status_unauthorized;
		case 403:
			return m.errors_status_forbidden;
		case 404:
			return m.errors_status_not_found;
		case 409:
		case 422:
			return m.errors_status_conflict;
		case 429:
			return m.errors_status_rate_limited;
	}
	return status >= 500 ? m.errors_status_server : undefined;
}

/**
 * Resolves a thrown value to localized text: first by error code, then by
 * status class, and finally the caller's own message. The server's English
 * `message` is never returned — it stays on the error for dev logging.
 */
export function resolveApiErrorMessage(error: unknown, fallback: string): string {
	if (!(error instanceof ApiError)) {
		return fallback;
	}
	const byCode = error.errorCode ? messageByCode[error.errorCode] : undefined;
	return (byCode ?? messageByStatus(error.status))?.() ?? fallback;
}
