<script lang="ts">
  const {
    balanceHistory,
    width = 150,
    height = 30
  }: {
    balanceHistory: Record<string, number>;
    width?: number;
    height?: number;
  } = $props<{ balanceHistory: Record<string, number>; width?: number; height?: number }>();

  type ChartPoint = { date: string; balance: number };

  const chartData = $derived(() => {
    const entries: ChartPoint[] = Object.entries(balanceHistory).map(([date, balance]) => ({
      date,
      balance
    }));
    return entries;
  });

  const chartPoints = $derived(() => {
    if (chartData().length === 0) return [];

    const minBalance = Math.min(...chartData().map((d) => d.balance));
    const maxBalance = Math.max(...chartData().map((d) => d.balance));
    const balanceRange = maxBalance - minBalance || 1;

    return chartData().map((point, index) => {
      const x = (index / (chartData().length - 1)) * (width - 10) + 5;
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

  export const chartState = () => {
    return {
      chartData: chartData(),
      chartPoints: chartPoints(),
      zeroLineY: zeroLineY()
    };
  };
</script>

{#if chartData().length > 1}
  <svg {width} {height}>
    <path d={pathD()} stroke="currentColor" stroke-width="2" fill="none" class="text-blue-600" />
    {#each chartPoints() as point}
      <circle cx={point.x} cy={point.y} r="2" fill="currentColor" class="text-blue-600" />
    {/each}
    <line
      x1="5"
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
