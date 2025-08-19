<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/ui/site-header.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import 'temporal-polyfill/global';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<SiteHeader />
<ScrollArea class="h-full	p-4">
	{@render children?.()}
</ScrollArea>
