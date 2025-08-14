<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { Account } from '$lib/models/account.svelte';
	import { create as createTransaction } from '$lib/models/transaction.svelte.js';

	const id = $props.id();
	let { account, open = $bindable() }: { account: Account; open: boolean } = $props();
	let description = $state('');
	let amount = $state('');
	let date = $state(new Date().toISOString().slice(0, 10));
	let descriptionInput: HTMLInputElement | null = $state(null);

	async function recordTransaction(event: Event) {
		event.preventDefault();
		await createTransaction(description, Number(amount), date, account.id);
		open = false;
		description = '';
		amount = '';
		date = new Date().toISOString().slice(0, 10);
	}

	$effect(() => {
		if (open) {
			descriptionInput?.focus();
		}
	});
</script>

<Drawer.Root bind:open>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Record Transaction</Drawer.Title>
		</Drawer.Header>

		<form class="grid items-start gap-4 px-4" onsubmit={recordTransaction}>
			<div class="grid gap-2">
				<Label for="description-{id}">Description</Label>
				<Input
					id="description-{id}"
					type="text"
					placeholder="Description"
					required={true}
					bind:ref={descriptionInput}
					bind:value={description}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="amount-{id}">Amount</Label>
				<Input
					id="amount-{id}"
					type="number"
					placeholder="Amount"
					required={true}
					bind:value={amount}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="date-{id}">Date</Label>
				<Input id="date-{id}" type="date" placeholder="Date" required={true} bind:value={date} />
			</div>

			<Button type="submit">Save</Button>
		</form>

		<Drawer.Footer>
			<Drawer.Close>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
