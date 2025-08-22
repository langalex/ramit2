import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BalanceChart from './BalanceChart.svelte';

describe('BalanceChart', () => {
  describe('chartState', () => {
    it('should return empty chartData when no balance history provided', () => {
      const { component } = render(BalanceChart, {
        props: {
          balanceHistory: {},
          width: 150,
          height: 30
        }
      });

      const state = component.chartState();
      expect(state.chartData).toEqual([]);
      expect(state.chart).toBeNull();
    });

    it('should calculate chart data correctly for positive balances', () => {
      const balanceHistory = {
        '2024-01-01': 100,
        '2024-01-02': 200,
        '2024-01-03': 150
      };

      const { component } = render(BalanceChart, {
        props: {
          balanceHistory,
          width: 150,
          height: 30
        }
      });

      const state = component.chartState();

      expect(state.chartData).toHaveLength(3);
      expect(state.chartData[0].date).toBe('2024-01-01');
      expect(state.chartData[0].balance).toBe(100);
      expect(state.chartData[1].date).toBe('2024-01-02');
      expect(state.chartData[1].balance).toBe(200);
      expect(state.chartData[2].date).toBe('2024-01-03');
      expect(state.chartData[2].balance).toBe(150);
    });

    it('should render no data if only single data point', () => {
      const balanceHistory = {
        '2024-01-01': 50
      };

      const { container } = render(BalanceChart, {
        props: {
          balanceHistory,
          width: 150,
          height: 30
        }
      });

      expect(container).toHaveTextContent('No data');
    });

    it('should sort dates correctly', () => {
      const balanceHistory = {
        '2024-01-03': 300,
        '2024-01-01': 100,
        '2024-01-02': 200
      };

      const { component } = render(BalanceChart, {
        props: {
          balanceHistory,
          width: 150,
          height: 30
        }
      });

      const state = component.chartState();

      expect(state.chartData[0].date).toBe('2024-01-01');
      expect(state.chartData[1].date).toBe('2024-01-02');
      expect(state.chartData[2].date).toBe('2024-01-03');
    });

    it('should render canvas when multiple data points exist', () => {
      const balanceHistory = {
        '2024-01-01': 100,
        '2024-01-02': 200
      };

      const { container } = render(BalanceChart, {
        props: {
          balanceHistory,
          width: 150,
          height: 30
        }
      });

      expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should render canvas with correct dimensions', () => {
      const balanceHistory = {
        '2024-01-01': 100,
        '2024-01-02': 200
      };

      const { container } = render(BalanceChart, {
        props: {
          balanceHistory,
          width: 300,
          height: 60
        }
      });

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      // Check the container div dimensions instead of canvas dimensions
      const containerDiv = container.querySelector('div');
      expect(containerDiv?.style.width).toBe('300px');
      expect(containerDiv?.style.height).toBe('60px');
    });
  });
});
