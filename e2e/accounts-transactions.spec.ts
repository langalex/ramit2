import { test, expect } from '@playwright/test';

test('account and transactions flow', async ({ page }) => {
	const accountName = `Test Account`;

	const tx1 = { description: 'Apples', amount: 10 };
	const tx2 = { description: 'Bananas', amount: 7 };

	await page.goto('/');

	// Add account
	await page.getByRole('button', { name: 'Add Account' }).click();
	await page.getByLabel('Name').fill(accountName);
	await page.getByRole('button', { name: 'Save' }).click();

	// Click the account row link
	await page.getByRole('link', { name: accountName }).click();

	// Add first transaction
	await page.getByRole('button', { name: '+' }).click();
	await page.getByLabel('Description').fill(tx1.description);
	await page.getByLabel('Amount').fill(String(tx1.amount));
	// Date is prefilled; leave as-is
	await page.getByRole('button', { name: 'Save' }).click();

	// Add second transaction
	await page.getByRole('button', { name: '+' }).click();
	await page.getByLabel('Description').fill(tx2.description);
	await page.getByLabel('Amount').fill(String(tx2.amount));
	await page.getByRole('button', { name: 'Save' }).click();

	// Verify both transactions visible (descriptions and amounts in their rows)
	let rowTx1 = page.getByRole('row').filter({ hasText: tx1.description });
	await expect(rowTx1).toBeVisible();
	await expect(rowTx1.getByRole('cell', { name: String(tx1.amount) })).toBeVisible();

	const rowTx2 = page.getByRole('row').filter({ hasText: tx2.description });
	await expect(rowTx2).toBeVisible();
	await expect(rowTx2.getByRole('cell', { name: String(tx2.amount) })).toBeVisible();

	// Verify total equals sum of both
	const totalBoth = tx1.amount + tx2.amount;
	await expect(page.locator('tfoot').getByRole('cell').last()).toHaveText(String(totalBoth));

	// Delete one transaction (tx2)
	const rowWithTx2 = page.getByRole('row').filter({ hasText: tx2.description });
	await rowWithTx2.getByRole('button').first().click();
	// Dropdown menu item may be role menuitem or just clickable text
	const deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
	if (await deleteMenuItem.count()) {
		await deleteMenuItem.click();
	} else {
		await page.getByText('Delete').click();
	}

	// Verify tx2 no longer visible and totals updated
	await expect(page.getByText(tx2.description)).toHaveCount(0);
	await expect(rowWithTx2).toHaveCount(0);

	const totalAfterDelete = tx1.amount;
	await expect(page.locator('tfoot').getByRole('cell').last()).toHaveText(String(totalAfterDelete));

	// Navigate back to accounts list
	await page.getByRole('link', { name: 'back' }).click();

	// Verify the account total reflects the remaining amount
	let accountRow = page
		.getByRole('row')
		.filter({ has: page.getByRole('link', { name: accountName }) });
	await expect(accountRow).toBeVisible();
	await expect(accountRow.getByRole('cell', { name: String(totalAfterDelete) })).toBeVisible();

	// reload app
	await page.goto('/');

	// Verify the account total reflects the remaining amount
	accountRow = page.getByRole('row').filter({ has: page.getByRole('link', { name: accountName }) });
	await expect(accountRow).toBeVisible();
	await expect(accountRow.getByRole('cell', { name: String(totalAfterDelete) })).toBeVisible();

	// navigate to transactions page
	await page.getByRole('link', { name: accountName }).click();

	// verify tx1 is still visible
	rowTx1 = page.getByRole('row').filter({ hasText: tx1.description });
	await expect(rowTx1).toBeVisible();
	await expect(rowTx1.getByRole('cell', { name: String(tx1.amount) })).toBeVisible();
});
