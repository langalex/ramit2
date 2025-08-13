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

export const remove = async (id: string): Promise<void> => {
	const transactionDoc = await transactionDb.get(id);
	if (transactionDoc) {
		await transactionDb.remove(transactionDoc);
	}
};

const transactionsByAccount = $state<Record<string, Transaction[]>>({});

transactionDb
	.changes({
		since: 'now',
		live: true,
		include_docs: true
	})
	.on('change', (change) => {
		const doc = change.doc;
		if (!doc) return;

		if (change.deleted) {
			Object.values(transactionsByAccount).forEach((transactions) => {
				const index = transactions.findIndex((t) => t.id === doc._id);
				if (index !== -1) {
					transactions.splice(index, 1);
				}
			});
		} else if (doc.type === 'Transaction') {
			if (!transactionsByAccount[doc.accountId]) {
				transactionsByAccount[doc.accountId] = [];
			}
			const transactions = transactionsByAccount[doc.accountId]!;
			transactions.push({
				id: doc._id,
				description: doc.description,
				amount: doc.amount,
				date: doc.date,
				accountId: doc.accountId
			});
		}
	});

export const forAccount = async (account: Account): Promise<Transaction[]> => {
	if (!transactionsByAccount[account.id]) {
		const transactions: Transaction[] = [];
		transactionsByAccount[account.id] = transactions;
		await transactionDb.createIndex({
			index: {
				fields: ['type', 'accountId']
			}
		});
		const result = await transactionDb.find({
			selector: { type: 'Transaction', accountId: account.id }
			// sort: ['date']
		});
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
	return transactionsByAccount[account.id]!;
};
