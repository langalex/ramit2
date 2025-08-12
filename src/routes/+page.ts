import { Account } from '$lib/models/account';

export const load = async () => {
	return {
		accounts: Account.all()
	};
};
