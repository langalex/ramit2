<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';

	const { data } = $props();
	const accounts = data.accounts;
</script>

<Table.Root>
	<Table.Body>
		{#each accounts as account (account.id)}
			<Table.Row>
				<Table.Cell class="font-medium"
					><a href={`/account?id=${account.id}`}>{account.name}</a></Table.Cell
				>
				<Table.Cell class="text-right">{account.balance}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
	<Table.Footer>
		<Table.Row>
			<Table.Cell>Total</Table.Cell>
			<Table.Cell class="text-right"
				>{accounts.reduce((acc, account) => acc + account.balance, 0)}</Table.Cell
			>
		</Table.Row>
	</Table.Footer>
</Table.Root>
