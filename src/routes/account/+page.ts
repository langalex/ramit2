import { find } from '$lib/models/account';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		redirect(302, '/');
	}
	const account = find(id);
	if (!account) {
		redirect(302, '/');
	}

	const transactions = account.transactions();
	return {
		account,
		transactions
	};
};
