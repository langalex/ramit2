import { describe, it, expect, beforeEach } from 'vitest';
import * as transactionModel from './transaction.svelte';
import db from '../db';
import { waitFor } from '$lib/test-helpers/wait-for';

describe('transaction model', () => {
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
		it('should create a transaction with valid data', async () => {
			const created = await transactionModel.create('Test Transaction', 100, '2024-01-01', 'a1');

			expect(created).toBeDefined();
			expect(created.amount).toBe(100);
			expect(created.description).toBe('Test Transaction');
			expect(created.date).toBe('2024-01-01');
			expect(created.accountId).toBe('a1');
		});

		it('should create a transaction with a specified id', async () => {
			const customId = 'custom-transaction-id';
			const created = await transactionModel.create(
				'Custom Transaction',
				250,
				'2024-01-01',
				'a1',
				customId
			);

			expect(created).toBeDefined();
			expect(created.amount).toBe(250);
			expect(created.description).toBe('Custom Transaction');
			expect(created.date).toBe('2024-01-01');
			expect(created.accountId).toBe('a1');
			expect(created.id).toBe(customId);
		});

		it('should create a transaction with a negative amount', async () => {
			const created = await transactionModel.create('Test Transaction', -100, '2024-01-01', 'a1');

			expect(created).toBeDefined();
			expect(created.amount).toBe(-100);
		});

		it('should create a transaction with a zero amount', async () => {
			const created = await transactionModel.create('Test Transaction', 0, '2024-01-01', 'a1');

			expect(created).toBeDefined();
			expect(created.amount).toBe(0);
		});

		it('error if transaction is invalid', async () => {
			await expect(transactionModel.create('name', 100, '', 'a1')).rejects.toThrow();
			await expect(transactionModel.create('name', 100, '2024-04-01', '')).rejects.toThrow();
		});
	});

	describe('remove', () => {
		it('should remove an existing transaction', async () => {
			const transaction = await transactionModel.create(
				'Test Transaction',
				100,
				'2024-01-01',
				'a1'
			);

			await transactionModel.remove(transaction.id);

			const [remainingTransactions, cancel] = await transactionModel.forAccount('a1');
			cancel();
			expect(remainingTransactions).toHaveLength(0);
		});

		it('should handle removing non-existent transaction gracefully', async () => {
			await expect(transactionModel.remove('non-existent-id')).rejects.toThrow();
		});
	});

	describe('find', () => {
		it('should find transaction by id', async () => {
			const transaction = await transactionModel.create(
				'Test Transaction',
				100,
				'2024-01-01',
				'a1'
			);

			const found = await transactionModel.find(transaction.id);
			expect(found).toEqual(transaction);
		});

		it('should return undefined for non-existent id', async () => {
			const found = await transactionModel.find('non-existent-id');
			expect(found).toBeUndefined();
		});
	});

	describe('update', () => {
		it('should update an existing transaction', async () => {
			const transaction = await transactionModel.create(
				'Original Description',
				100,
				'2024-01-01',
				'a1'
			);

			const updated = await transactionModel.update(
				'Updated Description',
				200,
				'2024-01-02',
				transaction.id
			);

			expect(updated.id).toBe(transaction.id);
			expect(updated.description).toBe('Updated Description');
			expect(updated.amount).toBe(200);
			expect(updated.date).toBe('2024-01-02');
			expect(updated.accountId).toBe('a1');
		});
	});

	describe('forAccount', () => {
		it('should return empty array for account with no transactions', async () => {
			const [transactions, cancel] = await transactionModel.forAccount('a1');
			cancel();
			expect(transactions).toEqual([]);
		});

		it('should return transactions for specific account', async () => {
			await transactionModel.create('Transaction 1', 100, '2024-01-01', 'a1');
			await transactionModel.create('Transaction 2', 200, '2024-01-02', 'a1');
			await transactionModel.create('Transaction 3', 300, '2024-01-02', 'a2');

			const [transactions, cancel] = await transactionModel.forAccount('a1');
			cancel();
			expect(transactions).toHaveLength(2);
			expect(transactions.every((t) => t.accountId === 'a1')).toBe(true);
		});

		it('should add transactions as they are created', async () => {
			const [transactions, cancel] = await transactionModel.forAccount('a1');
			expect(transactions).toEqual([]);

			await transactionModel.create('Transaction 1', 100, '2024-01-01', 'a1');
			await transactionModel.create('Transaction 3', 200, '2024-01-02', 'a2');
			await transactionModel.create('Transaction 2', 200, '2024-01-02', 'a1');

			await waitFor(() => transactions.length === 2);
			cancel();

			expect(transactions).toHaveLength(2);
			expect(transactions[0].description).toBe('Transaction 1');
			expect(transactions[1].description).toBe('Transaction 2');
		});
	});

	describe('balancesForAccounts', () => {
		it('should return zero balances for accounts with no transactions', async () => {
			const [balances, cancel] = await transactionModel.balancesForAccounts(['a1']);
			cancel();

			expect(balances['a1']).toBe(0);
		});

		it('should calculate correct balances for accounts with transactions', async () => {
			await transactionModel.create('Income', 1000, '2024-01-01', 'a1');
			await transactionModel.create('Expense', -300, '2024-01-02', 'a1');

			const [balances, cancel] = await transactionModel.balancesForAccounts(['a1']);
			cancel();

			expect(balances['a1']).toBe(700);
		});

		it('should update balances when transactions are added', async () => {
			await transactionModel.create('Test Transaction', 100, '2024-01-01', 'a1');

			const [balances, cancel] = await transactionModel.balancesForAccounts(['a1']);

			await transactionModel.create('Test Transaction', 100, '2024-01-01', 'a1');
			await waitFor(() => balances['a1'] === 200);
			cancel();

			expect(balances['a1']).toBe(200);
		});

		it('should update balances when transactions are removed', async () => {
			const transaction = await transactionModel.create(
				'Test Transaction',
				100,
				'2024-01-01',
				'a1'
			);
			const transaction2 = await transactionModel.create(
				'Test Transaction',
				200,
				'2024-01-01',
				'a1'
			);

			const [balances, cancel] = await transactionModel.balancesForAccounts(['a1']);

			await transactionModel.remove(transaction.id);
			await waitFor(() => balances['a1'] === 200);
			expect(balances['a1']).toBe(200);

			await transactionModel.remove(transaction2.id);
			await waitFor(() => balances['a1'] === 0);
			expect(balances['a1']).toBe(0);

			cancel();
		});
	});
});
