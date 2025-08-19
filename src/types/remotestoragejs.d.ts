import type { RamitAccount, RamitTransaction } from '../routes/import/+page.svelte';

declare module 'remotestoragejs' {
	interface RemoteStorage {
		ramit: {
			onAddAccount: (callback: (account: RamitAccount) => void) => void;
			onAddTransaction: (callback: (transaction: RamitTransaction) => void) => void;
		};
	}
}
