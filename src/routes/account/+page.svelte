<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Transaction } from '$lib/models/transaction';

	const { data } = $props();
	const account = data.account;
	const transactions = data.transactions;
	const months = transactions.reduce((acc, t) => {
		const month = t.date.slice(0, 7);
		const transactions = acc.get(month) || [];
		transactions.push(t);
		acc.set(month, transactions);
		return acc;
	}, new Map<string, Transaction[]>());
	const monthsArray = Object.keys(months);
</script>

<h1 class="text-2xl font-bold">{account.name}</h1>

<Table.Root>
	<Table.Body>
		{#each months as [month, transactions] (month)}
			<Table.Row class="bg-gray-100">
				<Table.Cell colspan={2}>{month}</Table.Cell>
				<Table.Cell class="text-right">
					{transactions.reduce((acc, t) => acc + t.amount, 0)}
				</Table.Cell>
			</Table.Row>
			{#each transactions as transaction (transaction.id)}
				<Table.Row>
					<Table.Cell class="font-medium">{transaction.date}</Table.Cell>
					<Table.Cell class="font-medium">{transaction.description}</Table.Cell>
					<Table.Cell class="text-right">{transaction.amount}</Table.Cell>
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
