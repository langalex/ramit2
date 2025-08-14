import { all } from '$lib/models/account.svelte';
import { balancesForAccounts } from '$lib/models/transaction.svelte';

export const load = async () => {
	const accounts = await all();
	const balancesByAccount = await balancesForAccounts(accounts);
	return {
		accounts,
		balancesByAccount
	};
};
