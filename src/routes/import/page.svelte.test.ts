import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as accountModel from '$lib/models/account.svelte';
import * as transactionModel from '$lib/models/transaction.svelte';
import db from '$lib/db';
import Page, { type RamitAccount, type RamitTransaction } from './+page.svelte';
import { render } from 'vitest-browser-svelte';
import { waitFor } from '@testing-library/dom';

// Create mock functions that we can call to simulate RemoteStorage events
let accountCallback: ((account: RamitAccount) => void) | null = null;
let transactionCallback: ((transaction: RamitTransaction) => void) | null = null;

// Mock RemoteStorage and Widget to avoid external dependencies
vi.mock('remotestoragejs', () =>
  vi.fn(function () {
    return {
      access: { claim: vi.fn() },
      caching: { enable: vi.fn() },
      on: vi.fn(),
      ramit: {
        onAddAccount: vi.fn((callback) => {
          accountCallback = callback;
        }),
        onAddTransaction: vi.fn((callback) => {
          transactionCallback = callback;
        })
      }
    };
  })
);

vi.mock('remotestorage-widget', () =>
  vi.fn(function () {
    return {
      attach: vi.fn()
    };
  })
);

// Helper functions to simulate RemoteStorage events
const simulateAccountImport = async (accountData: { id: string; name: string }) => {
  await accountCallback!(accountData);
};

const simulateTransactionImport = async (transactionData: {
  id: string;
  account_id: string;
  description: string;
  amount: number;
  date: number;
}) => {
  transactionCallback!(transactionData);
};

describe('Import Page Logic', () => {
  let testDb: ReturnType<typeof db>;

  beforeEach(async () => {
    testDb = db();
    const result = await testDb.allDocs({
      include_docs: true
    });
    result.rows.forEach((row) => {
      testDb.remove(row.id, row.value.rev);
    });

    // Reset callbacks
    accountCallback = null;
    transactionCallback = null;

    // Import the page component to register the callbacks
    // await import('../import/+page.svelte');
  });

  describe('Account Import Logic', () => {
    it('should create new account when account data is received via RemoteStorage', async () => {
      // Simulate account data from RemoteStorage
      const accountData = {
        id: 'test-account-id',
        name: 'Test Account'
      };

      const { container } = render(Page, {});

      // Simulate the RemoteStorage event
      await simulateAccountImport(accountData);

      expect(container).toHaveTextContent('1 new accounts imported');

      // Verify the account was created by the page logic
      const found = await accountModel.find(accountData.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(accountData.name);
      expect(found?.id).toBe(accountData.id);
    });

    it('should not create duplicate account if account already exists', async () => {
      // Create an account first
      const existingAccount = await accountModel.create('Existing Account', 'existing-id');
      expect(existingAccount).toBeDefined();

      // Simulate importing the same account via RemoteStorage
      const accountData = {
        id: 'existing-id',
        name: 'Updated Account'
      };

      const { container } = render(Page, {});

      // This should not create a duplicate (the page checks if account exists)
      await simulateAccountImport(accountData);
      expect(container).toHaveTextContent('0 new accounts imported');

      // Verify still only one account exists
      const [all, cancel] = await accountModel.all();
      cancel();
      expect(all.length).toBe(1);
      expect(all[0].name).toBe('Existing Account');
    });
  });

  describe('Transaction Import Logic', () => {
    it('should create new transaction when transaction data is received via RemoteStorage', async () => {
      // Simulate transaction data (amount in cents) from RemoteStorage
      const transactionData = {
        id: 'test-transaction-id',
        account_id: 'test-account-id',
        description: 'Test Transaction',
        amount: 1500, // $15.00 in cents
        date: 1704067200000 // January 1, 2024
      };

      const { container } = render(Page, {});

      // Simulate the RemoteStorage event
      await simulateTransactionImport(transactionData);

      await waitFor(() => {
        expect(container).toHaveTextContent('1 new transactions imported');
      });

      // Verify the transaction was created by the page logic with proper conversion
      const found = await transactionModel.find(transactionData.id);
      expect(found!.description).toBe(transactionData.description);
      expect(found!.amount).toBe(15);
      expect(found!.date).toBe('2024-01-01'); // Should be converted from timestamp
      expect(found!.accountId).toBe(transactionData.account_id);
      expect(found!.id).toBe(transactionData.id);
    });

    it('should update existing transaction when transaction data is received via RemoteStorage', async () => {
      // Create a transaction first
      const originalTransaction = await transactionModel.create(
        'Original Description',
        100,
        '2024-01-01',
        'test-account-id',
        'existing-transaction-id'
      );

      // Simulate updating the transaction via RemoteStorage
      const updatedData = {
        id: 'existing-transaction-id',
        account_id: 'test-account-id',
        description: 'Updated Description',
        amount: 20,
        date: 1704153600000 // January 2, 2024
      };

      const { container } = render(Page, {});

      // Simulate the RemoteStorage event
      await simulateTransactionImport(updatedData);

      await waitFor(() => {
        expect(container).toHaveTextContent('1 updated transactions imported');
      });

      // Verify the transaction was updated by the page logic
      const found = await transactionModel.find(originalTransaction.id);
      expect(found!.description).toBe('Updated Description');
      expect(found!.amount).toBe(20);
      expect(found!.date).toBe('2024-01-02'); // Should be converted from timestamp
    });
  });
});
