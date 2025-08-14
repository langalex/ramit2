<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { create as createAccount } from '$lib/models/account.svelte';

	const id = $props.id();
	let { open = $bindable() }: { open: boolean } = $props();
	let name = $state('');
	let nameInput: HTMLInputElement | null = $state(null);

	async function addAccount(event: Event) {
		event.preventDefault();
		await createAccount(name);
		open = false;
		name = '';
	}

	$effect(() => {
		if (open) {
			nameInput?.focus();
		}
	});
</script>

<Drawer.Root bind:open>
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
					bind:ref={nameInput}
				/>
			</div>

			<Button type="submit">Save</Button>
		</form>

		<Drawer.Footer>
			<Drawer.Close>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
