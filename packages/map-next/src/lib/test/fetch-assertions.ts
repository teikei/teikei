/**
 * Reads the headers a mocked `fetch` call was made with.
 *
 * Normalizes the shapes `apiRequest` may pass — no init object at all, an init
 * without headers, or a plain header record — so assertions describe the
 * request that went out rather than the client's internal argument choices.
 */
export function headersOf(call: unknown[] | undefined): Headers {
	const init = call?.[1] as RequestInit | undefined;
	return new Headers(init?.headers ?? {});
}
