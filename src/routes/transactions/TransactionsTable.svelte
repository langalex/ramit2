<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { Transaction } from '$lib/models/transaction.svelte.js';
	import { remove as removeTransaction } from '$lib/models/transaction.svelte.js';
	import { formatAmount } from '$lib/utils/format';

	const { transactions }: { transactions: Transaction[] } = $props();
	const months = $derived(
		transactions.reduce((acc, t) => {
			const month = t.date.slice(0, 7);
			const transactions = acc.get(month) || [];
			transactions.push(t);
			acc.set(month, transactions);
			return acc;
		}, new Map<string, Transaction[]>())
	);
</script>

<Table.Root>
	<Table.Body>
		{#each months as [month, transactions] (month)}
			<Table.Row class="bg-gray-100">
				<Table.Cell colspan={2}>{month}</Table.Cell>
				<Table.Cell class="text-right">
					{formatAmount(transactions.reduce((acc, t) => acc + t.amount, 0))}
				</Table.Cell>
				<Table.Cell></Table.Cell>
			</Table.Row>
			{#each transactions as transaction (transaction.id)}
				<Table.Row>
					<Table.Cell class="font-medium">{transaction.date}</Table.Cell>
					<Table.Cell class="font-medium">{transaction.description || '-'}</Table.Cell>
					<Table.Cell class="text-right">{formatAmount(transaction.amount)}</Table.Cell>
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
				>{formatAmount(transactions.reduce((acc, t) => acc + t.amount, 0))}</Table.Cell
			>
		</Table.Row>
	</Table.Footer>
</Table.Root>
