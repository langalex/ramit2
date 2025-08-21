<script lang="ts">
  import db from '$lib/db';
  import PouchDB from 'pouchdb-browser';
  import * as Card from '$lib/components/ui/card';

  const localDb = db();

  type SavedConfig = {
    url: string;
    username: string;
  };

  const saved: SavedConfig | null = (() => {
    try {
      const raw = localStorage.getItem('replicate-config');
      return raw ? (JSON.parse(raw) as SavedConfig) : null;
    } catch {
      return null;
    }
  })();

  let url = $state(saved?.url ?? '');
  let username = $state(saved?.username ?? '');
  let password = $state('');
  let status = $state<string | null>(null);
  let isSyncing = $state(false);
  let cancelSync: null | (() => void) = null;

  function saveConfig(cfg: SavedConfig) {
    localStorage.setItem('replicate-config', JSON.stringify(cfg));
  }

  function startSync() {
    if (!url) {
      status = 'Please enter a CouchDB URL';
      return;
    }
    // Persist latest url and username only (never password)
    saveConfig({ url, username });

    const remote = new PouchDB(url, { auth: { username, password } });
    const sync = localDb.sync(remote, { live: true, retry: true });
    isSyncing = true;
    status = 'Sync started';

    cancelSync = () => {
      sync.cancel();
      isSyncing = false;
      status = 'Sync cancelled';
    };

    sync.on('change', () => {
      status = 'Syncing...';
    });
    sync.on('paused', () => {
      status = 'Paused';
    });
    sync.on('active', () => {
      status = 'Active';
    });
    sync.on('denied', () => {
      status = 'Denied (check credentials/permissions)';
    });
    sync.on('complete', () => {
      isSyncing = false;
      status = 'Completed';
    });
    sync.on('error', (err: unknown) => {
      status = `Error: ${String((err as Error)?.message || err)}`;
    });
  }

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    startSync();
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Replicate to CouchDB</Card.Title>
    <Card.Description
      >You can replicate your data to (and from) a remote CouchDB database. This is useful if you
      want to use the same data on multiple devices, or if you want to backup your data.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <form onsubmit={onSubmit} class="space-y-3" novalidate>
      <div>
        <label class="mb-1 block text-sm" for="url">CouchDB URL</label>
        <input
          id="url"
          name="url"
          type="url"
          placeholder="https://my.server.com:5984/ramit2"
          bind:value={url}
          class="w-full rounded border px-2 py-1"
          required
        />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="mb-1 block text-sm" for="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            bind:value={username}
            class="w-full rounded border px-2 py-1"
            autocomplete="username"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm" for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            bind:value={password}
            class="w-full rounded border px-2 py-1"
            autocomplete="current-password"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="submit"
          class="rounded bg-violet-500 px-3 py-1 text-white disabled:opacity-50"
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing…' : 'Start Sync'}
        </button>
        {#if isSyncing}
          <button type="button" class="rounded border px-3 py-1" onclick={() => cancelSync?.()}
            >Cancel</button
          >
        {/if}
        {#if status}
          <div class="ml-auto text-sm opacity-80">{status}</div>
        {/if}
      </div>
    </form>
  </Card.Content>
  <Card.Footer>
    <p>Enter your remote CouchDB database URL.</p>
  </Card.Footer>
</Card.Root>
