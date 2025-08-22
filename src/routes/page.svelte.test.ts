import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Page from './+page.svelte';
import 'temporal-polyfill/global';

// Mock the account model
vi.mock('$lib/models/account.svelte', () => ({
  remove: vi.fn(),
  create: vi.fn()
}));

// Mock the data prop
const mockData = {
  accounts: [
    { id: '1', name: 'Checking Account' },
    { id: '2', name: 'Savings Account' }
  ],
  balancesByAccount: {
    '1': 1000,
    '2': 5000
  },
  balanceHistoriesByAccount: {
    '1': { '2024-01': 1000, '2024-02': 1100 },
    '2': { '2024-01': 5000, '2024-02': 5100 }
  },
  cancel: vi.fn()
};

describe('Main Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global confirm
    global.confirm = vi.fn();
  });

  it('renders accounts with dropdown menus', () => {
    const { container } = render(Page, { data: mockData });

    // Check that accounts are displayed
    expect(container).toHaveTextContent('Checking Account');
    expect(container).toHaveTextContent('Savings Account');
  });

  it('renders total balance correctly', () => {
    const { container } = render(Page, { data: mockData });

    // Check that total is displayed (1000 + 5000 = 6000)
    // German locale: 1.000 + 5.000 = 6.000
    expect(container).toHaveTextContent('6.000');
  });

  it('renders individual account balances', () => {
    const { container } = render(Page, { data: mockData });

    // German locale formatting
    expect(container).toHaveTextContent('1.000');
    expect(container).toHaveTextContent('5.000');
  });

  it('renders dropdown menu trigger for each account', () => {
    const { container } = render(Page, { data: mockData });

    // Check that dropdown triggers are rendered for each account
    expect(container.querySelector('[aria-label="Actions for Checking Account"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Actions for Savings Account"]')).toBeTruthy();
  });
});
