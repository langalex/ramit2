<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, CategoryScale, LinearScale, BarElement, BarController, Legend } from 'chart.js';
  import type { MonthlyIncomeExpenses } from '$lib/models/transaction.svelte';
  import { formatAmount } from '$lib/utils/format';

  Chart.register(CategoryScale, LinearScale, BarElement, BarController, Legend);

  const {
    data,
    width = 800,
    height = 400
  }: {
    data: MonthlyIncomeExpenses[];
    width?: number;
    height?: number;
  } = $props<{
    data: MonthlyIncomeExpenses[];
    width?: number;
    height?: number;
  }>();

  let canvas: HTMLCanvasElement | null = null;
  let chart: Chart | null = null;

  const createChart = () => {
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = data.map((item) => item.month);
    const incomeData = data.map((item) => item.income);
    const expensesData = data.map((item) => -item.expenses); // Make expenses negative

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            stack: 'stack1',
            yAxisID: 'y'
          },
          {
            label: 'Expenses',
            data: expensesData,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
            stack: 'stack1',
            yAxisID: 'y'
          },
          {
            label: 'Income (Right)', // this is only for the right y-axis
            data: incomeData,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            borderWidth: 0,
            stack: 'stack1',
            yAxisID: 'y1'
          },
          {
            label: 'Expenses (Right)', // this is only for the right y-axis
            data: expensesData,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            stack: 'stack1',
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
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                if (label === 'Expenses') {
                  return `${label}: ${formatAmount(Math.abs(value))}`;
                }
                return `${label}: ${formatAmount(value)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true
          },
          y: {
            display: true,
            position: 'left',
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return Math.abs(Number(value)).toFixed(0);
              }
            }
          },
          y1: {
            display: true,
            position: 'right',
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return Math.abs(Number(value)).toFixed(0);
              }
            }
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
</script>

<div style="width: {width}px; height: {height}px;">
  <canvas bind:this={canvas} {width} {height}></canvas>
</div>
