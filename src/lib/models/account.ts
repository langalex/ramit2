import type { Transaction } from './transaction';

export type Account = {
	id: string;
	name: string;
	balance: number;
};

export const Account = {
	all: () => {
		return [
			{
				id: '1',
				name: 'Anschaffungen',
				balance: 1000,
				transactions: () => {
					return [
						{ id: '1', amount: 2000, description: 'Kauf eines MacBooks', date: '2025-01-01' },
						{ id: '2', amount: 1250, description: 'Kauf eines iPads', date: '2025-01-02' },
						{ id: '3', amount: 850, description: 'Apple Watch', date: '2024-11-30' }
					] as Transaction[];
				}
			},
			{
				id: '2',
				name: 'Weggehen',
				balance: 1000,
				transactions: () =>
					[
						{ id: '4', amount: 82, description: 'Essen', date: '2024-12-01' },
						{ id: '5', amount: 75, description: 'Tanzen', date: '2024-12-15' },
						{ id: '6', amount: 125, description: 'Deutschlandreise', date: '2024-08-20' }
					] as Transaction[]
			},
			{
				id: '3',
				name: 'Urlaub',
				balance: 1000,
				transactions: () =>
					[
						{ id: '7', amount: 3250, description: 'Urlaub in Spanien', date: '2024-07-01' },
						{ id: '8', amount: 150, description: 'Zelten', date: '2024-07-01' },
						{ id: '9', amount: 6500, description: 'Malediven', date: '2024-07-01' }
					] as Transaction[]
			}
		];
	}
};

export const find = (id: string) => {
	return Account.all().find((a) => a.id === id);
};
