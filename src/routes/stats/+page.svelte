<script lang="ts">
  import BalanceChart from '$lib/components/BalanceChart.svelte';
  import IncomeExpensesChart from '$lib/components/IncomeExpensesChart.svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { onDestroy } from 'svelte';

  const { data } = $props();
  const account = data.account;
  const balanceHistory = data.balanceHistory;
  const monthlyData = data.monthlyData;
  const cancel = data.cancel;
  let chartContainer = $state<HTMLDivElement | null>(null);
  const chartWidth = $derived(Object.keys(balanceHistory).length * 10);
  let balanceChartScrollArea: HTMLDivElement | null = $state(null);
  let incomeExpensesChartScrollArea: HTMLDivElement | null = $state(null);

  $effect(() => {
    if (balanceChartScrollArea) {
      balanceChartScrollArea.scrollLeft = chartWidth;
    }
    if (incomeExpensesChartScrollArea) {
      incomeExpensesChartScrollArea.scrollLeft = chartWidth;
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
  <Card.Content class="space-y-6">
    <div>
      <h3 class="mb-4 text-lg font-semibold">Balance History</h3>
      <div bind:this={balanceChartScrollArea} class="overflow-x-scroll">
        <div bind:this={chartContainer}>
          <BalanceChart
            width={chartWidth}
            height={350}
            showYAxis={true}
            showXAxis={true}
            {balanceHistory}
          />
        </div>
      </div>
    </div>

    <div>
      <h3 class="mb-4 text-lg font-semibold">Monthly Income & Expenses</h3>
      <div bind:this={incomeExpensesChartScrollArea} class="overflow-x-scroll">
        <IncomeExpensesChart data={monthlyData} width={chartWidth} height={350} />
      </div>
    </div>
  </Card.Content>
</Card.Root>
