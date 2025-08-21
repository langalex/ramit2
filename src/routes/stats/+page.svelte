<script lang="ts">
  import BalanceChart from '$lib/components/BalanceChart.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { onDestroy } from 'svelte';

  const { data } = $props();
  const account = data.account;
  const balanceHistory = data.balanceHistory;
  const cancel = data.cancel;
  let chartContainer = $state<HTMLDivElement | null>(null);
  const chartWidth = $derived(Object.keys(balanceHistory).length * 10);
  let chartScrollArea: HTMLDivElement | null = $state(null);

  $effect(() => {
    if (chartScrollArea) {
      chartScrollArea.scrollLeft = chartWidth;
    }
  });

  onDestroy(() => {
    cancel();
  });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{account.name} Stats</Card.Title>
  </Card.Header>
  <Card.Content>
    <div bind:this={chartScrollArea} class="overflow-x-scroll">
      <div bind:this={chartContainer}>
        <BalanceChart
          width={chartWidth}
          height={450}
          showYAxis={true}
          showXAxis={true}
          {balanceHistory}
        />
      </div>
    </div>
  </Card.Content>
</Card.Root>
