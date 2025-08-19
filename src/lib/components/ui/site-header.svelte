<script>
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import {
    Root as DropdownMenu,
    Trigger as DropdownMenuTrigger,
    Content as DropdownMenuContent,
    Item as DropdownMenuItem
  } from '$lib/components/ui/dropdown-menu/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { goto } from '$app/navigation';
</script>

<header class="sticky top-0 z-50 w-full bg-violet-500 px-2 py-1 text-white">
  <div class="container-wrapper">
    <div class="flex items-center">
      <div>
        {#if page.url.pathname !== resolve('/')}
          <a href={resolve('/')}>
            <svg class="inline h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7"
              />
            </svg>
            back
          </a>
        {/if}
      </div>
      <div class="grow text-center">Ramit 2</div>
      <div class="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm" class="text-white hover:bg-violet-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onclick={() => goto('/import')}>RemoteStorage Import</DropdownMenuItem
            >
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</header>
