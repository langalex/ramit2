<script lang="ts">
	import AddTransactionDrawer from './AddTransactionDrawer.svelte';
	import TransactionsTable from './TransactionsTable.svelte';

	const { data } = $props();
	const account = data.account;
	const transactions = data.transactions;
	let showAddTransactionDrawer = $state(false);
</script>

<div class="flex p-1">
	<div class="text-xl">{account.name}</div>
	<button
		class="ml-auto bg-violet-500 px-2 text-white"
		onclick={() => (showAddTransactionDrawer = true)}>+</button
	>
</div>

<TransactionsTable {transactions} />
<AddTransactionDrawer {account} bind:open={showAddTransactionDrawer} />
