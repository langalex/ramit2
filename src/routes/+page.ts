import { all } from '$lib/models/account.svelte';
import { balancesForAccounts } from '$lib/models/transaction.svelte';

export const load = async () => {
	const [accounts, cancelAccounts] = await all();
	const [balancesByAccount, cancelBalances] = await balancesForAccounts(accounts.map((a) => a.id));

	return {
		accounts,
		balancesByAccount,
		cancel: () => {
			cancelAccounts();
			cancelBalances();
		}
	};
};
