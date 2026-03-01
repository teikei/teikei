import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendEntryContactMessage } from './entry-contact';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('entry-contact api', () => {
	beforeEach(() => {
		fetchMock.mockReset();
	});

	it('posts contact payload to entrycontactmessage endpoint', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 'farm-24',
				type: 'Farm',
				senderName: 'Jane Visitor',
				senderEmail: 'jane@example.com',
				text: 'Hello farm owner'
			})
		});

		await expect(
			sendEntryContactMessage({
				id: 'farm-24',
				type: 'Farm',
				senderName: 'Jane Visitor',
				senderEmail: 'jane@example.com',
				text: 'Hello farm owner'
			})
		).resolves.toEqual({
			id: 'farm-24',
			type: 'Farm',
			senderName: 'Jane Visitor',
			senderEmail: 'jane@example.com',
			text: 'Hello farm owner'
		});

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/entrycontactmessage'),
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: 'farm-24',
					type: 'Farm',
					senderName: 'Jane Visitor',
					senderEmail: 'jane@example.com',
					text: 'Hello farm owner'
				})
			})
		);
	});
});
