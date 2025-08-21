<script lang="ts">
  const {
    balanceHistory,
    width = 150,
    height = 30,
    showYAxis = false
  }: {
    balanceHistory: Record<string, number>;
    width?: number;
    height?: number;
    showYAxis?: boolean;
  } = $props<{
    balanceHistory: Record<string, number>;
    width?: number;
    height?: number;
    showYAxis?: boolean;
  }>();

  type ChartPoint = { date: string; balance: number };

  const chartData = $derived(() => {
    const entries: ChartPoint[] = Object.entries(balanceHistory)
      .map(([date, balance]) => ({
        date,
        balance
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return entries;
  });

  const chartPoints = $derived(() => {
    if (chartData().length === 0) return [];

    const minBalance = Math.min(...chartData().map((d) => d.balance));
    const maxBalance = Math.max(...chartData().map((d) => d.balance));
    const balanceRange = maxBalance - minBalance || 1;

    return chartData().map((point, index) => {
      const x =
        (index / (chartData().length - 1)) * (width - (showYAxis ? 40 : 10)) + (showYAxis ? 35 : 5);
      const y = height - 5 - ((point.balance - minBalance) / balanceRange) * (height - 10);
      return { x, y, ...point };
    });
  });

  const pathD = $derived(() => {
    if (chartPoints().length === 0) return '';

    return chartPoints()
      .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
      .join(' ');
  });

  const zeroLineY = $derived(() => {
    if (chartData().length === 0) return 0;

    const minBalance = Math.min(...chartData().map((d) => d.balance));
    const maxBalance = Math.max(...chartData().map((d) => d.balance));
    const balanceRange = maxBalance - minBalance || 1;

    // Calculate y-position for zero balance
    return height - 5 - ((0 - minBalance) / balanceRange) * (height - 10);
  });

  const yAxisTicks = $derived(() => {
    if (!showYAxis || chartData().length === 0) return [];

    const minBalance = Math.min(...chartData().map((d) => d.balance));
    const maxBalance = Math.max(...chartData().map((d) => d.balance));
    const balanceRange = maxBalance - minBalance || 1;

    const ticks = [];
    const numTicks = 5;

    for (let i = 0; i <= numTicks; i++) {
      const balance = minBalance + (i / numTicks) * balanceRange;
      const y = height - 5 - ((balance - minBalance) / balanceRange) * (height - 10);
      ticks.push({ balance, y });
    }

    return ticks;
  });

  export const chartState = () => {
    return {
      chartData: chartData(),
      chartPoints: chartPoints(),
      zeroLineY: zeroLineY(),
      yAxisTicks: yAxisTicks()
    };
  };
</script>

{#if chartData().length > 1}
  <svg {width} {height}>
    {#if showYAxis}
      <!-- Y-axis line -->
      <line
        x1="30"
        y1="5"
        x2="30"
        y2={height - 5}
        stroke="currentColor"
        stroke-width="1"
        class="text-gray-400"
      />

      <!-- Y-axis ticks and labels -->
      {#each yAxisTicks() as tick (tick.y)}
        <line
          x1="30"
          y1={tick.y}
          x2="35"
          y2={tick.y}
          stroke="currentColor"
          stroke-width="1"
          class="text-gray-400"
        />
        <text x="25" y={tick.y + 3} text-anchor="end" font-size="10" class="text-gray-500">
          {tick.balance.toFixed(0)}
        </text>
      {/each}
    {/if}

    <path d={pathD()} stroke="currentColor" stroke-width="2" fill="none" class="text-blue-600" />
    {#each chartPoints() as point (point.x)}
      <circle cx={point.x} cy={point.y} r="2" fill="currentColor" class="text-blue-600" />
    {/each}
    <line
      x1={showYAxis ? 35 : 5}
      x2={width - 5}
      y1={zeroLineY()}
      y2={zeroLineY()}
      stroke="currentColor"
      stroke-width="1"
      stroke-dasharray="5,5"
      class="text-gray-400"
    />
  </svg>
{:else}
  <div class="text-xs text-gray-400">No data</div>
{/if}
