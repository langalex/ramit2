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
  import Github from '@lucide/svelte/icons/github';
  import SunIcon from '@lucide/svelte/icons/sun';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

  import { toggleMode } from 'mode-watcher';
</script>

<header class="sticky top-0 z-50 w-full bg-violet-500 px-2 py-1 text-white">
  <div class="container-wrapper">
    <div class="flex items-center">
      <div class="w-20">
        {#if page.url.pathname !== resolve('/')}
          <a href={resolve('/')} class="flex items-center gap-2">
            <ChevronLeftIcon class="h-5 w-5" />
            <span>Back</span>
          </a>
        {/if}
      </div>
      <div class="grow text-center">
        <a href={resolve('/')}>Ramit 2</a>
      </div>
      <div class="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
        <Button onclick={toggleMode} variant="ghost" size="icon">
          <SunIcon
            class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
          />
          <MoonIcon
            class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
          />
          <span class="sr-only">Toggle theme</span>
        </Button>
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
            <DropdownMenuItem>
              <a href={resolve('/import')}>RemoteStorage Import</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href={resolve('/replicate')}>Replicate to CouchDB</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a
                href="https://github.com/langalex/ramit2"
                target="_blank"
                class="flex items-center gap-2"
              >
                <Github class="h-4 w-4" />
                Source
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</header>
