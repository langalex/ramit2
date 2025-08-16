import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as accountModel from './account.svelte';
import db from '../db';

describe('account model', () => {
	let testDb: ReturnType<typeof db>;

	beforeEach(async () => {
		testDb = db();
		const result = await testDb.allDocs({
			include_docs: true
		});
		result.rows.forEach((row) => {
			testDb.remove(row.id, row.value.rev);
		});
	});

	describe('create', () => {
		it('should create an account with valid name', async () => {
			const created = await accountModel.create('Test Account');

			expect(created).toBeDefined();
			expect(created?.name).toBe('Test Account');
			expect(created?.id).toBeDefined();
		});
	});

	describe('all', () => {
		it('should return empty array initially', async () => {
			const [accounts, cancel] = await accountModel.all();
			cancel();
			expect(accounts).toEqual([]);
		});

		it('should return all created accounts', async () => {
			await accountModel.create('Account 1');
			await accountModel.create('Account 2');

			const [accounts, cancel] = await accountModel.all();
			cancel();
			expect(accounts).toHaveLength(2);
		});

		it('should update the account list as accounts are created', async () => {
			const [accounts, cancel] = await accountModel.all();
			expect(accounts).toEqual([]);

			await accountModel.create('Account 1');
			await waitFor(() => accounts.length === 1);
			cancel();

			expect(accounts).toHaveLength(1);
			expect(accounts[0].name).toBe('Account 1');
		});
	});

	describe('find', () => {
		it('should find account by id', async () => {
			const account = await accountModel.create('Test Account');

			const found = await accountModel.find(account.id);
			expect(found).toEqual(account);
		});

		it('should return undefined for non-existent id', async () => {
			const found = await accountModel.find('non-existent-id');
			expect(found).toBeUndefined();
		});
	});

	function waitFor(condition: () => boolean, timeout = 1000) {
		return new Promise((resolve) => {
			const interval = setInterval(() => {
				if (condition()) {
					clearInterval(interval);
					resolve(true);
				}
			}, 10);
			setTimeout(() => {
				clearInterval(interval);
				resolve(false);
			}, timeout);
		});
	}
});
