<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController
  } from 'chart.js';

  Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController);

  const {
    balanceHistory,
    width = 150,
    height = 30,
    showYAxis = false,
    showXAxis = false
  }: {
    balanceHistory: Record<string, number>;
    width?: number;
    height?: number;
    showYAxis?: boolean;
    showXAxis?: boolean;
  } = $props<{
    balanceHistory: Record<string, number>;
    width?: number;
    height?: number;
    showYAxis?: boolean;
    showXAxis?: boolean;
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

  // svelte-ignore non_reactive_update
  let canvas: HTMLCanvasElement | null = null;
  let chart: Chart | null = null;

  const createChart = () => {
    if (!canvas || chartData().length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = chartData().map((point) => point.date);
    const data = chartData().map((point) => point.balance);

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Balance',
            data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: 'rgb(59, 130, 246)',
            fill: false,
            tension: 0.1,
            yAxisID: 'y'
          },
          {
            label: 'Balance (Right)', // this is only for the right y-axis
            data,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            borderWidth: 0,
            pointRadius: 0,
            fill: false,
            tension: 0.1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          x: {
            display: showXAxis,
            grid: {
              display: false
            }
          },
          y: {
            display: showYAxis,
            position: 'left',
            grid: {
              display: false
            }
          },
          y1: {
            display: showYAxis,
            position: 'right',
            grid: {
              display: false
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 4
          }
        }
      }
    });
  };

  onMount(() => {
    createChart();
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });

  export const chartState = () => {
    return {
      chartData: chartData(),
      chart: chart
    };
  };
</script>

{#if chartData().length > 1}
  <div style="width: {width}px; height: {height}px;">
    <canvas bind:this={canvas} {width} {height}></canvas>
  </div>
{:else}
  <div class="text-xs text-gray-400">No data</div>
{/if}
