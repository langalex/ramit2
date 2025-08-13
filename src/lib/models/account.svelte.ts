import db from '../db';
const accountDb = db<AccountDoc>();

export type Account = {
	id: string;
	name: string;
};

type AccountDoc = Omit<Account, 'id'> & {
	type: 'Account';
};

export const create = async (name: string) => {
	if (!name) {
		throw new Error('Name is required');
	}
	await accountDb.post({
		type: 'Account',
		name
	});
};

const allAccounts = $state<Account[]>([]);

accountDb
	.changes({
		since: 'now',
		live: true,
		include_docs: true
	})
	.on('change', (change) => {
		if (change.doc) {
			allAccounts.push({
				id: change.doc._id,
				name: change.doc.name
			});
		}
	});

export const all = async () => {
	if (allAccounts.length === 0) {
		await accountDb.createIndex({
			index: {
				fields: ['type']
			}
		});
		const result = await accountDb.find({
			selector: { type: 'Account' }
			// sort: ['name']
		});
		result.docs.forEach((doc) => {
			allAccounts.push({
				id: doc._id,
				name: doc.name
			});
		});
	}

	return allAccounts;
};

export const find = async (id: string) => {
	return (await all()).find((a) => a.id === id);
};
