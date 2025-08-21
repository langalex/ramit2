import { describe, it, expect, beforeEach, vi } from 'vitest';
import Page from './+page.svelte';
import { render } from 'vitest-browser-svelte';
import type { Account } from '$lib/models/account.svelte';

// Mock the page load function to provide test data
vi.mock('./+page.ts', () => ({
  default: {
    load: vi.fn()
  }
}));

describe('Stats Page', () => {
  let mockAccount: Account;
  let mockBalanceHistory: Record<string, number>;
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
    mockCancel = vi.fn();
  });

  it('should render account stats with title', async () => {
    const { container } = render(Page, {
      data: {
        account: mockAccount,
        balanceHistory: mockBalanceHistory,
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
        cancel: mockCancel
      }
    });

    // Check that the chart container exists
    const chartContainer = container.querySelector('div');
    expect(chartContainer).toBeTruthy();

    // Check that BalanceChart is rendered (it should be a child of the container)
    expect(container.querySelector('canvas')).toBeTruthy();
  });
});
