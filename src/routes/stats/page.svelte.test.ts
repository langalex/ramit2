import { describe, it, expect, beforeEach, vi } from 'vitest';
import Page from './+page.svelte';
import { render } from 'vitest-browser-svelte';
import type { Account } from '$lib/models/account.svelte';
import type { MonthlyIncomeExpenses } from '$lib/models/transaction.svelte';

// Mock the page load function to provide test data
vi.mock('./+page.ts', () => ({
  default: {
    load: vi.fn()
  }
}));

describe('Stats Page', () => {
  let mockAccount: Account;
  let mockBalanceHistory: Record<string, number>;
  let mockMonthlyData: MonthlyIncomeExpenses[];
  let mockCancel: () => void;

  beforeEach(async () => {
    // Create test data
    mockAccount = {
      id: 'test-account-1',
      name: 'Test Account'
    };
    mockBalanceHistory = {
      '2024-01': 1000,
      '2024-02': 1500,
      '2024-03': 1200,
      '2024-04': 2000
    };
    mockMonthlyData = [
      { month: '2024-01', income: 2000, expenses: 1000 },
      { month: '2024-02', income: 2500, expenses: 1000 },
      { month: '2024-03', income: 1800, expenses: 600 },
      { month: '2024-04', income: 3000, expenses: 1000 }
    ];
    mockCancel = vi.fn();
  });

  it('should render account stats with title', async () => {
    const { container } = render(Page, {
      data: {
        account: mockAccount,
        balanceHistory: mockBalanceHistory,
        monthlyData: mockMonthlyData,
        cancel: mockCancel
      }
    });

    expect(container).toHaveTextContent('Test Account Stats');
  });

  it('should render BalanceChart component', async () => {
    const { container } = render(Page, {
      data: {
        account: mockAccount,
        balanceHistory: mockBalanceHistory,
        monthlyData: mockMonthlyData,
        cancel: mockCancel
      }
    });

    // Check that the chart container exists
    const chartContainer = container.querySelector('div');
    expect(chartContainer).toBeTruthy();

    // Check that BalanceChart is rendered (it should be a child of the container)
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('should render IncomeExpensesChart component', async () => {
    const { container } = render(Page, {
      data: {
        account: mockAccount,
        balanceHistory: mockBalanceHistory,
        monthlyData: mockMonthlyData,
        cancel: mockCancel
      }
    });

    // Check that both chart sections exist
    expect(container).toHaveTextContent('Balance History');
    expect(container).toHaveTextContent('Monthly Income & Expenses');

    // Check that both charts are rendered
    const canvases = container.querySelectorAll('canvas');
    expect(canvases).toHaveLength(2);
  });
});
