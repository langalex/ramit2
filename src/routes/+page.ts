import { all } from '$lib/models/account.svelte';

export const load = async () => {
	return {
		accounts: await all()
	};
};
