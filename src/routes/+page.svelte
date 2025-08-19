<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js';
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import { onDestroy } from 'svelte';
  import BalanceChart from '$lib/components/BalanceChart.svelte';

  import { resolve } from '$app/paths';
  import AddAccountDrawer from './AddAccountDrawer.svelte';
  import { formatAmount } from '$lib/utils/format';

  const { data } = $props();
  const { balancesByAccount, balanceHistoriesByAccount, cancel } = data;
  const accounts = $derived([...data.accounts].sort((a, b) => a.name.localeCompare(b.name)));

  let chartContainer = $state<HTMLDivElement | null>(null);
  let showAddAccountDrawer = $state(false);

  const total = $derived(
    Object.values(balancesByAccount).reduce((acc, balance) => acc + balance, 0)
  );
  const chartWidth = $derived(chartContainer?.clientWidth ?? 150);

  function filterRecent(balanceHistory: Record<string, number>): Record<string, number> {
    const since = oneYearAgo();
    return Object.fromEntries(
      Object.entries(balanceHistory).filter(([yearMonth]) => {
        return yearMonth > since;
      })
    );
  }

  function oneYearAgo(): string {
    const date = Temporal.Now.plainDateISO().subtract({ years: 1 });
    return date.year + '-' + date.month;
  }

  onDestroy(() => {
    cancel();
  });
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Cell>Account</Table.Cell>
      <Table.Cell class="text-center">Balance History</Table.Cell>
      <Table.Cell class="text-right">Balance</Table.Cell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each accounts as account (account.id)}
      <Table.Row>
        <Table.Cell class="font-medium"
          ><a class="inline-block w-full" href={resolve('/transactions') + `?id=${account.id}`}
            >{account.name}</a
          ></Table.Cell
        >
        <Table.Cell class="p-0 text-center" bind:ref={chartContainer}>
          <BalanceChart
            width={chartWidth}
            height={30}
            balanceHistory={filterRecent(balanceHistoriesByAccount[account.id] ?? {})}
          />
        </Table.Cell>
        <Table.Cell class="text-right"
          >{formatAmount(balancesByAccount[account.id] ?? 0)}</Table.Cell
        >
      </Table.Row>
    {/each}
  </Table.Body>
  <Table.Footer>
    <Table.Row>
      <Table.Cell colspan={2}>Total</Table.Cell>
      <Table.Cell class="text-center">{formatAmount(total)}</Table.Cell>
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
