import { describe, expect, it } from 'vitest';
import { isValidHttpUrl, safeHttpUrl } from './url';

describe('isValidHttpUrl', () => {
	it('accepts http and https URLs', () => {
		expect(isValidHttpUrl('http://example.org')).toBe(true);
		expect(isValidHttpUrl('https://example.org/path?q=1')).toBe(true);
	});

	it('rejects dangerous and non-http(s) schemes', () => {
		expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
		expect(isValidHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
		expect(isValidHttpUrl('vbscript:msgbox(1)')).toBe(false);
		expect(isValidHttpUrl('ftp://example.org')).toBe(false);
	});

	it('rejects non-URL strings', () => {
		expect(isValidHttpUrl('not a url')).toBe(false);
		expect(isValidHttpUrl('/relative/path')).toBe(false);
		expect(isValidHttpUrl('')).toBe(false);
	});
});

describe('safeHttpUrl', () => {
	it('returns the trimmed URL for valid http(s) values', () => {
		expect(safeHttpUrl('  https://example.org  ')).toBe('https://example.org');
	});

	it('returns undefined for javascript: and other unsafe schemes', () => {
		expect(safeHttpUrl('javascript:alert(document.cookie)')).toBeUndefined();
		expect(safeHttpUrl('JavaScript:alert(1)')).toBeUndefined();
		expect(safeHttpUrl('data:text/html,x')).toBeUndefined();
	});

	it('returns undefined for empty / nullish input', () => {
		expect(safeHttpUrl(undefined)).toBeUndefined();
		expect(safeHttpUrl(null)).toBeUndefined();
		expect(safeHttpUrl('')).toBeUndefined();
		expect(safeHttpUrl('   ')).toBeUndefined();
	});
});
