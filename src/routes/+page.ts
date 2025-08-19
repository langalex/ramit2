import { all } from '$lib/models/account.svelte';
import { balanceHistoriesForAccounts, balancesForAccounts } from '$lib/models/transaction.svelte';

export const load = async () => {
  const [accounts, cancelAccounts] = await all();
  const [balancesByAccount, cancelBalances] = await balancesForAccounts(accounts.map((a) => a.id));
  const [balanceHistoriesByAccount, cancelBalanceHistories] = await balanceHistoriesForAccounts(
    accounts.map((a) => a.id)
  );

  return {
    accounts,
    balancesByAccount,
    balanceHistoriesByAccount,
    cancel: () => {
      cancelAccounts();
      cancelBalances();
      cancelBalanceHistories();
    }
  };
};
