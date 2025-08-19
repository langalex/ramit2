import db from '$lib/db';
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
	accountId: string,
	id?: string
): Promise<Transaction> => {
	if (!date || !accountId) {
		throw new Error('Invalid transaction');
	}
	const doc = await (id
		? transactionDb.put({
				type: 'Transaction',
				description,
				amount,
				date,
				accountId,
				_id: id
			})
		: transactionDb.post({
				type: 'Transaction',
				description,
				amount,
				date,
				accountId
			}));
	return {
		id: doc.id,
		description,
		amount,
		date,
		accountId
	};
};

export const update = async (
	description: string,
	amount: number,
	date: string,
	id: string
): Promise<Transaction> => {
	const transactionDoc = await transactionDb.get(id);
	await transactionDb.put({
		...transactionDoc,
		description,
		amount,
		date
	});
	return {
		id,
		description,
		amount,
		date,
		accountId: transactionDoc.accountId
	};
};

export const remove = async (id: string): Promise<void> => {
	const transactionDoc = await transactionDb.get(id);
	if (transactionDoc) {
		await transactionDb.remove(transactionDoc);
	}
};

export const forAccount = async (accountId: string): Promise<[Transaction[], () => void]> => {
	const transactions = $state<Transaction[]>([]);
	await transactionDb.createIndex({
		index: {
			fields: ['type', 'accountId']
		}
	});
	const result = await transactionDb.find({
		selector: { type: 'Transaction', accountId: accountId }
		// sort: ['date']
	});
	const changes = transactionDb.changes({
		since: 'now',
		live: true,
		include_docs: true
	});
	changes.on('change', (change) => {
		if (!change.doc) return;

		if (change.deleted) {
			const doc = change.doc as { _id: string; _rev: string };
			const index = transactions.findIndex((t) => t.id === doc._id);
			if (index !== -1) {
				transactions.splice(index, 1);
			}
		} else {
			const doc = change.doc;
			if (doc.type !== 'Transaction' || doc.accountId !== accountId) {
				return;
			}
			transactions.push({
				id: doc._id,
				description: doc.description,
				amount: doc.amount,
				date: doc.date,
				accountId: doc.accountId
			});
		}
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
	return [transactions, () => changes.cancel()];
};

export const balancesForAccounts = async (
	accountIds: string[]
): Promise<[Record<string, number>, () => void]> => {
	const balancesByAccountId = $state<Record<string, number>>({});
	accountIds.forEach((accountId) => {
		balancesByAccountId[accountId] = 0;
	});
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

	if (!(await find('_design/balances'))) {
		// @ts-expect-error db expects a TransactionDoc but we are adding a design doc
		await transactionDb.put(designDoc);
	}

	const changes = transactionDb.changes({
		since: 'now',
		live: true,
		include_docs: true
	});
	changes.on('change', (change) => {
		if (!change.doc) return;

		if (change.deleted) {
			// we don't know which account the transaction was for, so we need to update all balances
			accountIds.forEach((accountId) => {
				balancesByAccountId[accountId] = 0;
			});
			updateBalances(balancesByAccountId);
		} else {
			const doc = change.doc;
			if (doc.type !== 'Transaction' || !accountIds.includes(doc.accountId)) {
				return;
			}
			balancesByAccountId[doc.accountId] += doc.amount;
		}
	});

	await updateBalances(balancesByAccountId);
	return [balancesByAccountId, () => changes.cancel()];
};

const updateBalances = async (balancesByAccountId: Record<string, number>): Promise<void> => {
	const result = await transactionDb.query('balances/byAccountId', {
		reduce: true,
		group: true,
		group_level: 1,
		keys: Object.keys(balancesByAccountId)
	});
	result.rows.forEach((row) => {
		balancesByAccountId[row.key] = row.value;
	});
};

export async function find(id: string): Promise<Transaction | undefined> {
	try {
		const doc = await transactionDb.get(id);
		return {
			id: doc._id,
			amount: doc.amount,
			description: doc.description,
			date: doc.date,
			accountId: doc.accountId
		};
	} catch {
		return undefined;
	}
}
