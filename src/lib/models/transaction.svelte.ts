import db from '$lib/db';
const transactionDb = db<TransactionDoc>();
const genericDb = db<object>();

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
			fields: ['type', 'accountId', 'date']
		}
	});
	const result = await transactionDb.find({
		selector: { type: 'Transaction', accountId: accountId },
		sort: [{ type: 'desc' }, { accountId: 'desc' }, { date: 'desc' }],
		limit: 200
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
		await genericDb.put(designDoc);
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

export const balanceHistoriesForAccounts = async (
	accountIds: string[]
): Promise<[Record<string, Record<string, number>>, () => void]> => {
	const balanceHistoriesByAccountId = $state<Record<string, Record<string, number>>>({});
	accountIds.forEach((accountId) => {
		balanceHistoriesByAccountId[accountId] = {};
	});

	const designDoc = {
		_id: '_design/balanceHistories',
		views: {
			byAccountIdYearMonth: {
				map: `function (doc) {
						if (doc.type === 'Transaction') {
							emit([doc.accountId, doc.date.substring(0, 7)], doc.amount);
						}
					}`,
				reduce: '_sum'
			}
		}
	};

	// Check if design doc exists and create if it doesn't
	if (!(await find('_design/balanceHistories'))) {
		await genericDb.put(designDoc);
	}

	const changes = transactionDb.changes({
		since: 'now',
		live: true,
		include_docs: true
	});

	changes.on('change', (change) => {
		if (!change.doc) return;

		if (change.deleted) {
			// we don't know which account the transaction was for, so we need to update all histories
			accountIds.forEach((accountId) => {
				balanceHistoriesByAccountId[accountId] = {};
			});
			updateBalanceHistories(balanceHistoriesByAccountId, accountIds);
		} else {
			const doc = change.doc;
			if (doc.type !== 'Transaction' || !accountIds.includes(doc.accountId)) {
				return;
			}
			// Update the specific period for the changed transaction
			updateBalanceHistories(balanceHistoriesByAccountId, accountIds);
		}
	});

	await updateBalanceHistories(balanceHistoriesByAccountId, accountIds);
	return [balanceHistoriesByAccountId, () => changes.cancel()];
};

const updateBalanceHistories = async (
	balanceHistoriesByAccountId: Record<string, Record<string, number>>,
	accountIds: string[]
): Promise<void> => {
	// Reset all histories
	Object.keys(balanceHistoriesByAccountId).forEach((accountId: string) => {
		balanceHistoriesByAccountId[accountId] = {};
	});

	// Build running balances for each account
	const accountBalances: Record<string, number> = {};
	accountIds.forEach((accountId) => {
		accountBalances[accountId] = 0;
	});

	// Query for each account separately to ensure we get all data
	for (const accountId of accountIds) {
		const result = await transactionDb.query('balanceHistories/byAccountIdYearMonth', {
			reduce: true,
			group: true,
			group_level: 2,
			startkey: [accountId],
			endkey: [accountId, '\uffff']
		});

		// Sort rows by date (year-month) to calculate running balances
		const rows = result.rows;

		// Calculate running balances and fill gaps
		let lastBalance = 0;

		rows.forEach((row) => {
			const [, key] = row.key;
			lastBalance += row.value;
			balanceHistoriesByAccountId[accountId][key] = lastBalance;
		});

		// Fill gaps between months with the previous month's balance
		if (rows.length > 0) {
			const months = rows.map((row) => row.key[1]);
			const firstMonth = months[0];
			const lastMonth = months[months.length - 1];

			// Parse first and last month to get year and month
			const [firstYear, firstMonthNum] = firstMonth.split('-').map(Number);
			const [lastYear, lastMonthNum] = lastMonth.split('-').map(Number);

			// Fill gaps month by month
			let currentYear = firstYear;
			let currentMonth = firstMonthNum;
			let currentBalance = 0;

			while (currentYear < lastYear || (currentYear === lastYear && currentMonth <= lastMonthNum)) {
				const monthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

				// If this month has transactions, update the current balance
				if (balanceHistoriesByAccountId[accountId][monthKey] !== undefined) {
					currentBalance = balanceHistoriesByAccountId[accountId][monthKey];
				} else {
					// Fill gap with previous month's balance
					balanceHistoriesByAccountId[accountId][monthKey] = currentBalance;
				}

				// Move to next month
				currentMonth++;
				if (currentMonth > 12) {
					currentMonth = 1;
					currentYear++;
				}
			}
		}
	}
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
