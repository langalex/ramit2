import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BalanceChart from './BalanceChart.svelte';

describe('BalanceChart', () => {
	describe('chartState', () => {
		it('should return empty arrays when no balance history provided', () => {
			const { component } = render(BalanceChart, {
				props: {
					balanceHistory: {},
					width: 150,
					height: 30
				}
			});

			const state = component.chartState();
			expect(state.chartData).toEqual([]);
			expect(state.chartPoints).toEqual([]);
			expect(state.zeroLineY).toBe(0);
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

			expect(state.chartPoints).toHaveLength(3);
			expect(state.chartPoints[0].x).toBe(5); // First point at left edge
			expect(state.chartPoints[2].x).toBe(145); // Last point at right edge

			// Zero line should be below the chart area since all balances are positive
			expect(state.zeroLineY).toBeGreaterThan(25);
		});

		it('should calculate chart data correctly for negative balances', () => {
			const balanceHistory = {
				'2024-01-01': -100,
				'2024-01-02': -200,
				'2024-01-03': -150
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
			expect(state.chartPoints).toHaveLength(3);

			// Zero line should be above the chart area since all balances are negative
			expect(state.zeroLineY).toBeLessThan(5);
		});

		it('should calculate chart data correctly for mixed positive and negative balances', () => {
			const balanceHistory = {
				'2024-01-01': -100,
				'2024-01-02': 0,
				'2024-01-03': 100
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
			expect(state.chartPoints).toHaveLength(3);

			// Zero line should be in the middle since we have -100 to +100 range
			expect(state.zeroLineY).toBe(15);
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

		it('should handle zero balance range correctly', () => {
			const balanceHistory = {
				'2024-01-01': 0,
				'2024-01-02': 0,
				'2024-01-03': 0
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
			expect(state.chartPoints).toHaveLength(3);

			// All points should have the same y value since balance range is 0
			expect(state.chartPoints[0].y).toBe(state.chartPoints[1].y);
			expect(state.chartPoints[1].y).toBe(state.chartPoints[2].y);
		});
	});
});
