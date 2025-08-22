<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js';
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { onDestroy } from 'svelte';
  import BalanceChart from '$lib/components/BalanceChart.svelte';

  import { resolve } from '$app/paths';
  import AddAccountDrawer from './AddAccountDrawer.svelte';
  import { formatAmount } from '$lib/utils/format';
  import { remove as removeAccount } from '$lib/models/account.svelte';
  import { EllipsisVertical } from '@lucide/svelte';

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
    const since = twoYearsAgo();
    return Object.fromEntries(
      Object.entries(balanceHistory).filter(([yearMonth]) => {
        return yearMonth > since;
      })
    );
  }

  function twoYearsAgo(): string {
    const date = Temporal.Now.plainDateISO().subtract({ months: 24 });
    return date.year + '-' + date.month;
  }

  async function handleRemoveAccount(accountId: string, accountName: string) {
    if (confirm(`Are you sure you want to remove the account "${accountName}"?`)) {
      try {
        await removeAccount(accountId);
      } catch (error) {
        console.error('Failed to remove account:', error);
      }
    }
  }

  onDestroy(() => {
    cancel();
  });
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
        <Table.Cell class="p-0 text-center" bind:ref={chartContainer}>
          <a href={resolve('/stats') + `?id=${account.id}`}>
            <BalanceChart
              width={chartWidth}
              height={60}
              showYAxis={false}
              balanceHistory={filterRecent(balanceHistoriesByAccount[account.id] ?? {})}
            />
          </a>
        </Table.Cell>
        <Table.Cell class="text-right"
          >{formatAmount(balancesByAccount[account.id] ?? 0)}</Table.Cell
        >
        <Table.Cell class="w-12">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              class="rounded p-1 transition-colors hover:bg-gray-100"
              aria-label={`Actions for ${account.name}`}
            >
              <EllipsisVertical class="h-4 w-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                aria-label={`Remove account ${account.name}`}
                onclick={() => handleRemoveAccount(account.id, account.name)}
                class="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Remove Account
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
  <Table.Footer>
    <Table.Row>
      <Table.Cell colspan={3}>Total</Table.Cell>
      <Table.Cell class="text-right">{formatAmount(total)}</Table.Cell>
    </Table.Row>
  </Table.Footer>
</Table.Root>

<div class="m-auto w-full py-4">
  <button
    type="button"
    onclick={() => (showAddAccountDrawer = true)}
    class={buttonVariants({ variant: 'outline' })}>Add Account</button
  >
</div>

<AddAccountDrawer bind:open={showAddAccountDrawer} />
