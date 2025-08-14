<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { create as createAccount } from '$lib/models/account.svelte';

	const { data } = $props();
	const { balancesByAccount } = data;
	const accounts = $derived([...data.accounts].sort((a, b) => a.name.localeCompare(b.name)));

	const id = $props.id();
	let name = $state('');
	let showAddAccountDrawer = $state(false);

	async function addAccount(event: Event) {
		event.preventDefault();
		await createAccount(name);
		showAddAccountDrawer = false;
		name = '';
	}
</script>

<Table.Root>
	<Table.Body>
		{#each accounts as account (account.id)}
			<Table.Row>
				<Table.Cell class="font-medium"
					><a class="inline-block w-full" href={`/transactions?id=${account.id}`}>{account.name}</a
					></Table.Cell
				>
				<Table.Cell class="text-right">{balancesByAccount[account.id] ?? 0}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
	<Table.Footer>
		<Table.Row>
			<Table.Cell>Total</Table.Cell>
			<Table.Cell class="text-right"
				>{Object.values(balancesByAccount).reduce((acc, balance) => acc + balance, 0)}</Table.Cell
			>
		</Table.Row>
	</Table.Footer>
</Table.Root>

<div class="m-auto w-full p-4">
	<Drawer.Root bind:open={showAddAccountDrawer}>
		<Drawer.Trigger class={buttonVariants({ variant: 'outline' })}>Add Account</Drawer.Trigger>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title>Add Account</Drawer.Title>
			</Drawer.Header>

			<form class="grid items-start gap-4 px-4" onsubmit={addAccount}>
				<div class="grid gap-2">
					<Label for="name-{id}">Name</Label>
					<Input
						id="name-{id}"
						type="text"
						placeholder="Account Name"
						required={true}
						bind:value={name}
					/>
				</div>

				<Button type="submit">Save</Button>
			</form>

			<Drawer.Footer>
				<Drawer.Close>Cancel</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</div>
