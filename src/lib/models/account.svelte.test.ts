import { describe, it, expect, beforeEach } from 'vitest';
import * as accountModel from './account.svelte';
import * as transactionModel from './transaction.svelte';
import db from '../db';
import { waitFor } from '$lib/test-helpers/wait-for';

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

    it('should create an account with specified id', async () => {
      const customId = 'custom-account-id';
      const created = await accountModel.create('Custom Account', customId);

      expect(created).toBeDefined();
      expect(created.name).toBe('Custom Account');
      expect(created.id).toBe(customId);
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

    it('should remove accounts from the list when they are deleted', async () => {
      const account = await accountModel.create('Account to Delete');
      const [accounts, cancel] = await accountModel.all();

      await waitFor(() => accounts.length === 1);
      expect(accounts[0].id).toBe(account.id);

      await accountModel.remove(account.id);
      await waitFor(() => accounts.length === 0);
      cancel();

      expect(accounts).toHaveLength(0);
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

  describe('remove', () => {
    it('should delete account and all its associated transactions', async () => {
      // Create an account
      const account = await accountModel.create('Test Account');

      // Create some transactions for this account
      const transaction1 = await transactionModel.create(
        'Transaction 1',
        100,
        '2024-01-01',
        account.id
      );
      const transaction2 = await transactionModel.create(
        'Transaction 2',
        -50,
        '2024-01-02',
        account.id
      );

      // Verify transactions exist
      const [transactions, cancelTransactions] = await transactionModel.forAccount(account.id);
      await waitFor(() => transactions.length === 2);
      expect(transactions).toHaveLength(2);
      cancelTransactions();

      // Remove the account
      await accountModel.remove(account.id);

      // Verify account is deleted
      const foundAccount = await accountModel.find(account.id);
      expect(foundAccount).toBeUndefined();

      // Verify all transactions for this account are deleted
      const [transactionsAfterDelete, cancelTransactionsAfterDelete] =
        await transactionModel.forAccount(account.id);
      await waitFor(() => transactionsAfterDelete.length === 0);
      expect(transactionsAfterDelete).toHaveLength(0);
      cancelTransactionsAfterDelete();

      // Verify individual transactions no longer exist
      const foundTransaction1 = await transactionModel.find(transaction1.id);
      const foundTransaction2 = await transactionModel.find(transaction2.id);
      expect(foundTransaction1).toBeUndefined();
      expect(foundTransaction2).toBeUndefined();
    });
  });
});
