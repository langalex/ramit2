<script lang="ts">
  import { onDestroy } from 'svelte';
  import AddTransactionDrawer from './AddTransactionDrawer.svelte';
  import TransactionsTable from './TransactionsTable.svelte';
  import PlusIcon from '@lucide/svelte/icons/plus';

  const { data } = $props();
  const account = data.account;
  const transactions = data.transactions;
  const cancel = data.cancel;
  let showAddTransactionDrawer = $state(false);

  onDestroy(() => {
    cancel();
  });
</script>

<div class="flex items-center p-1">
  <div class="text-xl">{account.name}</div>
  <button
    aria-label="Add transaction"
    class="ml-auto rounded-md bg-violet-500 p-2 text-white hover:bg-violet-600"
    onclick={() => (showAddTransactionDrawer = true)}
  >
    <PlusIcon class="h-4 w-4" />
  </button>
</div>

<TransactionsTable {transactions} />
<AddTransactionDrawer {account} bind:open={showAddTransactionDrawer} />
