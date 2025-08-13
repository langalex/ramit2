import db from '$lib/db';
import type { Account } from './account.svelte';
const transactionDb = db<TransactionDoc>();

export type Transaction = {
	id: string;
	amount: number;
	description: string;
	date: string;
	accountId: string;
};

type TransactionDoc = Omit<Transaction, 'id'> & {
	type: 'Transaction';
};

export const forAccount = async (account: Account) => {
	await transactionDb.createIndex({
		index: {
			fields: ['type', 'accountId']
		}
	});
	const result = await transactionDb.find({
		selector: { type: 'Account', accountId: account.id }
		// sort: ['date']
	});
	return result.docs.map((doc) => ({
		id: doc._id,
		amount: doc.amount,
		description: doc.description,
		date: doc.date,
		accountId: doc.accountId
	}));
};
