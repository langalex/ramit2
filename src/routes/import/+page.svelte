<script module>
	export type RamitAccount = {
		id: string;
		name: string;
	};

	export type RamitTransaction = {
		id: string;
		account_id: string;
		description: string;
		amount: number;
		date: number;
	};
</script>

<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import RemoteStorage from 'remotestoragejs';
	import Widget from 'remotestorage-widget';
	import { onMount } from 'svelte';
	import {
		create as createAccount,
		find as findAccount,
		type Account
	} from '$lib/models/account.svelte';
	import {
		create as createTransaction,
		update as updateTransaction,
		find as findTransaction,
		type Transaction
	} from '$lib/models/transaction.svelte';
	import type BaseClient from 'remotestoragejs/release/types/baseclient';
	import type { ChangeObj } from 'remotestoragejs/release/types/interfaces/change_obj';

	const offsetToDateString = (offset: number): string => {
		const date = new Date(offset);
		return date.toISOString().substring(0, 10);
	};

	const initStorage = (): RemoteStorage => {
		const Ramit = {
			name: 'ramit',
			builder: function (privateClient: BaseClient) {
				privateClient.declareType('account', {
					description: 'an account with a balance',
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'id'
						},
						name: {
							type: 'string'
						}
					}
				});

				privateClient.declareType('transaction', {
					description: 'a financial transaction',
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'id'
						},
						account_id: {
							type: 'string',
							format: 'id'
						},
						description: {
							type: 'string'
						},
						amount: {
							type: 'integer'
						},
						date: {
							type: 'integer'
						}
					}
				});

				return {
					exports: {
						onAddAccount: function (callback: (account: RamitAccount) => void) {
							privateClient.on('change', function (e) {
								const change = e as ChangeObj;
								const newValue =
									typeof change.newValue === 'string'
										? JSON.parse(change.newValue)
										: change.newValue;
								if (
									change.oldValue === undefined &&
									newValue['@context'] === 'http://remotestorage.io/spec/modules/ramit/account'
								) {
									callback(newValue);
								}
							});
						},

						onAddTransaction: function (callback: (transaction: RamitTransaction) => void) {
							privateClient.on('change', function (e) {
								const change = e as ChangeObj;
								const newValue =
									typeof change.newValue === 'string'
										? JSON.parse(change.newValue)
										: change.newValue;
								if (
									change.oldValue === undefined &&
									newValue['@context'] === 'http://remotestorage.io/spec/modules/ramit/transaction'
								) {
									callback(newValue);
								}
							});
						}
					}
				};
			}
		};
		const remoteStorage = new RemoteStorage({
			cache: true,
			changeEvents: {
				local: true,
				window: false,
				remote: true,
				conflict: false
			},
			// logging: true,
			modules: [Ramit]
		});

		remoteStorage.access.claim('ramit', 'r');
		remoteStorage.caching.enable('/ramit/');

		remoteStorage.on('error', function (event) {
			console.log('remoteStorage error', event);
		});

		return remoteStorage;
	};

	const remoteStorage = initStorage();

	const accounts = $state<Account[]>([]);
	const newTransactions = $state<Transaction[]>([]);
	const updatedTransactions = $state<Transaction[]>([]);

	onMount(() => {
		const widget = new Widget(remoteStorage);
		widget.attach('widget-wrapper');
	});

	remoteStorage.ramit.onAddAccount(async function (accountData: RamitAccount) {
		if (!(await findAccount(accountData.id))) {
			const account = await createAccount(accountData.name, accountData.id);
			accounts.push(account);
		}
	});

	remoteStorage.ramit.onAddTransaction(async function (transactionData: RamitTransaction) {
		if (await findTransaction(transactionData.id)) {
			const transaction = await updateTransaction(
				transactionData.description,
				transactionData.amount,
				offsetToDateString(transactionData.date),
				transactionData.id
			);
			updatedTransactions.push(transaction);
		} else {
			const transaction = await createTransaction(
				transactionData.description,
				transactionData.amount / 100, // Ramit stores cents
				offsetToDateString(transactionData.date),
				transactionData.account_id,
				transactionData.id
			);
			newTransactions.push(transaction);
		}
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Import from Ramit version 1</Card.Title>
		<Card.Description
			>You can import your data from <a href="https://ramit.5apps.com/">Ramit version 1</a> remote storage
			by clicking the button below.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<div id="widget-wrapper"></div>
	</Card.Content>
	<Card.Footer>
		<p>
			{accounts.length} new accounts imported.<br />
			{newTransactions.length} new transactions imported.<br />
			{updatedTransactions.length} updated transactions imported.
		</p>
	</Card.Footer>
</Card.Root>
