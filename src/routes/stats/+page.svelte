<script lang="ts">
  import BalanceChart from '$lib/components/BalanceChart.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { onDestroy } from 'svelte';

  const { data } = $props();
  const account = data.account;
  const balanceHistory = data.balanceHistory;
  const cancel = data.cancel;
  let chartContainer = $state<HTMLDivElement | null>(null);
  const chartWidth = $derived(chartContainer?.clientWidth ?? 300);

  onDestroy(() => {
    cancel();
  });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{account.name} Stats</Card.Title>
  </Card.Header>
  <Card.Content>
    <div bind:this={chartContainer}>
      <BalanceChart width={chartWidth} height={250} showYAxis={true} {balanceHistory} />
    </div>
  </Card.Content>
</Card.Root>
