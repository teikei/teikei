import { describe, it, expect } from 'vitest';
import { getRedirectUrl, isRedirect } from './redirect';
import type { Page } from '@sveltejs/kit';

// Helper function to create a mock Page object
function createMockPage(hash: string): Page {
	return {
		url: new URL(`https://example.com/${hash}`)
	} as Page;
}

describe('getRedirectUrl', () => {
	it('returns #/ when no redirect parameter is present', () => {
		const page = createMockPage('#/signin');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('returns #/ when redirect parameter is empty', () => {
		const page = createMockPage('#/signin?redirect=');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('accepts valid internal hash-based redirects', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fprofile');
		expect(getRedirectUrl(page)).toBe('#/profile');
	});

	it('accepts complex internal paths with query parameters', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fentries%2F123%3Fview%3Dedit');
		expect(getRedirectUrl(page)).toBe('#/entries/123?view=edit');
	});

	it('blocks external URLs with https protocol', () => {
		const page = createMockPage('#/signin?redirect=https%3A%2F%2Fevil.com');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks external URLs with http protocol', () => {
		const page = createMockPage('#/signin?redirect=http%3A%2F%2Fevil.com');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks protocol-relative URLs', () => {
		const page = createMockPage('#/signin?redirect=%2F%2Fevil.com');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks redirects not starting with hash', () => {
		const page = createMockPage('#/signin?redirect=%2Fprofile');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks javascript: protocol', () => {
		const page = createMockPage('#/signin?redirect=javascript%3Aalert(1)');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks data: protocol', () => {
		const page = createMockPage('#/signin?redirect=data%3Atext%2Fhtml%2C%3Cscript%3Ealert(1)%3C%2Fscript%3E');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks URL-encoded protocol separators', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fprofile%253a%2F%2Fevil.com');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks redirects with multiple hashes', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fprofile%23javascript%3Aalert(1)');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks javascript: in decoded form', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fjavascript%3Aalert(1)');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks inline event handlers like onerror', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fprofile%3Fonerror%3Dalert(1)');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks inline event handlers like onload', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fimg%20onload%3Dalert(1)');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks script tags', () => {
		const page = createMockPage('#/signin?redirect=%23%2F%3Cscript%3Ealert(1)%3C%2Fscript%3E');
		expect(getRedirectUrl(page)).toBe('#/');
	});

	it('blocks malformed URL encoding', () => {
		const page = createMockPage('#/signin?redirect=%23%2F%profile%XX');
		expect(getRedirectUrl(page)).toBe('#/');
	});
});

describe('isRedirect', () => {
	it('returns true when redirect parameter is present', () => {
		const page = createMockPage('#/signin?redirect=%23%2Fprofile');
		expect(isRedirect(page)).toBe(true);
	});

	it('returns false when redirect parameter is not present', () => {
		const page = createMockPage('#/signin');
		expect(isRedirect(page)).toBe(false);
	});

	it('returns true even when redirect parameter is empty', () => {
		const page = createMockPage('#/signin?redirect=');
		expect(isRedirect(page)).toBe(true);
	});
});
