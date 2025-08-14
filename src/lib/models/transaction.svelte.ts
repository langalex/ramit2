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
const balancesByAccount = $state<Record<string, number>>({});

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

export const balancesForAccounts = async (accounts: Account[]): Promise<Record<string, number>> => {
	if (Object.keys(balancesByAccount).length === 0) {
		const designDoc = {
			_id: '_design/balances',
			views: {
				byAccountId: {
					map: `function (doc) {
						if (doc.type === 'Transaction') {
							emit(doc.accountId, doc.amount);
						}
					}`,
					reduce: '_sum'
				}
			}
		};

		if (!(await docExists('_design/balances'))) {
			// @ts-expect-error db expects a TransactionDoc but we are adding a design doc
			await transactionDb.put(designDoc);
		}

		const result = await transactionDb.query('balances/byAccountId', {
			reduce: true,
			group: true,
			group_level: 1,
			keys: accounts.map((a) => a.id)
		});
		result.rows.forEach((row) => {
			balancesByAccount[row.key] = row.value;
		});
	}
	return balancesByAccount;
};

async function docExists(id: string): Promise<boolean> {
	try {
		await transactionDb.get(id);
		return true;
	} catch {
		return false;
	}
}
