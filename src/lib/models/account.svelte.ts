import db from '../db';
const accountDb = db<AccountDoc>();

export type Account = {
  id: string;
  name: string;
};

type AccountDoc = Omit<Account, 'id'> & {
  type: 'Account';
};

export const create = async (name: string, id?: string): Promise<Account> => {
  if (!name) {
    throw new Error('Name is required');
  }
  const doc = await (id
    ? accountDb.put({
        type: 'Account',
        name,
        _id: id
      })
    : accountDb.post({
        type: 'Account',
        name
      }));

  return {
    id: doc.id,
    name: name
  };
};

export const all = async (): Promise<[Account[], () => void]> => {
  const allAccounts = $state<Account[]>([]);
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
  const changes = accountDb.changes({
    since: 'now',
    live: true,
    include_docs: true
  });
  changes.on('change', (change) => {
    const doc = change.doc;
    if (doc && doc.type === 'Account') {
      allAccounts.push({
        id: doc._id,
        name: doc.name
      });
    }
  });

  return [allAccounts, () => changes.cancel()];
};

export const find = async (id: string): Promise<Account | undefined> => {
  try {
    const doc = await accountDb.get(id);
    return {
      id: doc._id,
      name: doc.name
    };
  } catch {
    return undefined;
  }
};
