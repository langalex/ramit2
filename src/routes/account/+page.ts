import { find } from '$lib/models/account.svelte';
import { forAccount } from '$lib/models/transaction.svelte';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		redirect(302, '/');
	}
	const account = await find(id);
	if (!account) {
		redirect(302, '/');
	}

	const transactions = await forAccount(account);
	return {
		account,
		transactions
	};
};
