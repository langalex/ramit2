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

export const create = async (
	description: string,
	amount: number,
	date: string,
	accountId: string
): Promise<void> => {
	await transactionDb.post({
		type: 'Transaction',
		description,
		amount,
		date,
		accountId
	});
};

const transactionsByAccount = $state<Map<string, Transaction[]>>(new Map());

transactionDb
	.changes({
		since: 'now',
		live: true,
		include_docs: true
	})
	.on('change', (change) => {
		if (change.doc?.type === 'Transaction') {
			if (!transactionsByAccount.has(change.doc.accountId)) {
				transactionsByAccount.set(change.doc.accountId, []);
			}
			const transactions = transactionsByAccount.get(change.doc.accountId)!;
			transactions.push({
				id: change.doc._id,
				description: change.doc.description,
				amount: change.doc.amount,
				date: change.doc.date,
				accountId: change.doc.accountId
			});
		}
	});

export const forAccount = async (account: Account): Promise<Transaction[]> => {
	if (!transactionsByAccount.has(account.id)) {
		const transactions: Transaction[] = [];
		transactionsByAccount.set(account.id, transactions);
		await transactionDb.createIndex({
			index: {
				fields: ['type', 'accountId']
			}
		});
		const result = await transactionDb.find({
			selector: { type: 'Transaction', accountId: account.id }
			// sort: ['date']
		});
		console.log('result', result);
		result.docs.forEach((doc) => {
			transactions.push({
				id: doc._id,
				amount: doc.amount,
				description: doc.description,
				date: doc.date,
				accountId: doc.accountId
			});
		});
	}
	return transactionsByAccount.get(account.id)!;
};
