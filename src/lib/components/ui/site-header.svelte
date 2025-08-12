<script>
	import { page } from '$app/state';
</script>

<header class="sticky top-0 z-50 w-full bg-violet-500 px-2 py-1 text-white">
	<div class="container-wrapper">
		<div class="flex items-center">
			<div>
				{#if page.url.pathname !== '/'}
					<a href="/">back</a>
				{/if}
			</div>
			<div class="grow text-center">Ramit 2</div>
			<!-- <div class="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
				<div class="hidden w-full flex-1 md:flex md:w-auto md:flex-none">MENU</div>
				LINK
			</div> -->
		</div>
	</div>
</header>
