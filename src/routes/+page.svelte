<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { resolve } from '$app/paths';
	import AddAccountDrawer from './AddAccountDrawer.svelte';

	const { data } = $props();
	const { balancesByAccount } = data;
	const accounts = $derived([...data.accounts].sort((a, b) => a.name.localeCompare(b.name)));

	let showAddAccountDrawer = $state(false);
	const total = $derived(
		Object.values(balancesByAccount).reduce((acc, balance) => acc + balance, 0)
	);
</script>

<Table.Root>
	<Table.Body>
		{#each accounts as account (account.id)}
			<Table.Row>
				<Table.Cell class="font-medium"
					><a class="inline-block w-full" href={resolve('/transactions') + `?id=${account.id}`}
						>{account.name}</a
					></Table.Cell
				>
				<Table.Cell class="text-right">{balancesByAccount[account.id] ?? 0}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
	<Table.Footer>
		<Table.Row>
			<Table.Cell>Total</Table.Cell>
			<Table.Cell class="text-right">{total}</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>

<div class="m-auto w-full p-4">
	<button
		type="button"
		onclick={() => (showAddAccountDrawer = true)}
		class={buttonVariants({ variant: 'outline' })}>Add Account</button
	>
</div>

<AddAccountDrawer bind:open={showAddAccountDrawer} />
