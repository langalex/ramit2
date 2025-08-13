<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { Transaction } from '$lib/models/transaction.svelte.js';
	import {
		create as createTransaction,
		remove as removeTransaction
	} from '$lib/models/transaction.svelte.js';

	const { data } = $props();
	const account = data.account;
	const transactions = data.transactions;
	const months = $derived(
		transactions.reduce((acc, t) => {
			const month = t.date.slice(0, 7);
			const transactions = acc.get(month) || [];
			transactions.push(t);
			acc.set(month, transactions);
			return acc;
		}, new Map<string, Transaction[]>())
	);

	const id = $props.id();
	let showAddTransactionDrawer = $state(false);
	let description = $state('');
	let amount = $state(0);
	let date = $state(new Date().toISOString().slice(0, 10));

	async function recordTransaction(event: Event) {
		event.preventDefault();
		await createTransaction(description, amount, date, account.id);
		showAddTransactionDrawer = false;
		description = '';
		amount = 0;
		date = new Date().toISOString().slice(0, 10);
	}
</script>

<div class="flex p-1">
	<div class="text-xl">{account.name}</div>
	<button
		class="ml-auto bg-violet-500 px-2 text-white"
		onclick={() => (showAddTransactionDrawer = true)}>+</button
	>
</div>

<Table.Root>
	<Table.Body>
		{#each months as [month, transactions] (month)}
			<Table.Row class="bg-gray-100">
				<Table.Cell colspan={2}>{month}</Table.Cell>
				<Table.Cell class="text-right">
					{transactions.reduce((acc, t) => acc + t.amount, 0)}
				</Table.Cell>
				<Table.Cell></Table.Cell>
			</Table.Row>
			{#each transactions as transaction (transaction.id)}
				<Table.Row>
					<Table.Cell class="font-medium">{transaction.date}</Table.Cell>
					<Table.Cell class="font-medium">{transaction.description}</Table.Cell>
					<Table.Cell class="text-right">{transaction.amount}</Table.Cell>
					<Table.Cell>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant="ghost" size="icon">
									<EllipsisIcon />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									<DropdownMenu.Item>Edit</DropdownMenu.Item>
									<DropdownMenu.Item
										onclick={() => {
											removeTransaction(transaction.id);
										}}>Delete</DropdownMenu.Item
									>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>
				</Table.Row>
			{/each}
		{/each}
	</Table.Body>
	<Table.Footer>
		<Table.Row class="font-bold">
			<Table.Cell>Total</Table.Cell>
			<Table.Cell></Table.Cell>
			<Table.Cell class="text-right"
				>{transactions.reduce((acc, t) => acc + t.amount, 0)}</Table.Cell
			>
		</Table.Row>
	</Table.Footer>
</Table.Root>

<Drawer.Root bind:open={showAddTransactionDrawer}>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Record Transaction</Drawer.Title>
		</Drawer.Header>

		<form class="grid items-start gap-4 px-4" onsubmit={recordTransaction}>
			<div class="grid gap-2">
				<Label for="description-{id}">Description</Label>
				<Input
					id="description-{id}"
					type="text"
					placeholder="Description"
					required={true}
					bind:value={description}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="amount-{id}">Amount</Label>
				<Input
					id="amount-{id}"
					type="number"
					placeholder="Amount"
					required={true}
					bind:value={amount}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="date-{id}">Date</Label>
				<Input id="date-{id}" type="date" placeholder="Date" required={true} bind:value={date} />
			</div>

			<Button type="submit">Save</Button>
		</form>

		<Drawer.Footer>
			<Drawer.Close>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
