import { describe, it, expect, beforeEach } from 'vitest';
// Mock pouchdb-browser to avoid real network calls and provide minimal API used by the app
// vi.mock('pouchdb-browser', () => {
//   class FakePouchDB {
//     static plugin = vi.fn();
//     name: string;
//     constructor(nameOrUrl: string) {
//       this.name = String(nameOrUrl);
//     }
//     sync(_remote: unknown, _opts: unknown) {
//       const handlers: Record<string, Array<(...args: any[]) => void>> = {};
//       const api = {
//         on(event: string, cb: (...args: any[]) => void) {
//           (handlers[event] ||= []).push(cb);
//           return api;
//         },
//         cancel: vi.fn()
//       };
//       queueMicrotask(() => {
//         handlers['active']?.forEach((fn) => fn());
//         handlers['paused']?.forEach((fn) => fn());
//       });
//       return api as any;
//     }
//     allDocs = vi.fn(async () => ({ rows: [] }));
//     remove = vi.fn(async () => {});
//     createIndex = vi.fn(async () => {});
//     find = vi.fn(async () => ({ docs: [] }));
//     changes = vi.fn(() => ({ on: vi.fn(), cancel: vi.fn() }));
//     put = vi.fn(async () => ({ ok: true }) as const);
//     get = vi.fn(async () => null as any);
//   }
//   return { default: FakePouchDB };
// });

import db from '$lib/db';
import Page from './+page.svelte';
import { render } from 'vitest-browser-svelte';
import { screen, fireEvent, waitFor } from '@testing-library/dom';

describe('Replicate Page', () => {
  let testDb: ReturnType<typeof db>;

  beforeEach(async () => {
    // Clear local DB
    testDb = db();
    const result = await testDb.allDocs({ include_docs: true });
    for (const row of result.rows) {
      await testDb.remove(row.id, row.value.rev);
    }
    // Clear stored config
    localStorage.removeItem('replicate-config');
  });

  it('renders form and persists URL/username to localStorage', async () => {
    render(Page);

    const urlInput = screen.getByLabelText('CouchDB URL') as HTMLInputElement;
    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    await fireEvent.input(urlInput, { target: { value: 'https://example.com/ramit2' } });
    await fireEvent.input(usernameInput, { target: { value: 'alice' } });
    await fireEvent.input(passwordInput, { target: { value: 'secret' } });

    const submit = screen.getByRole('button', { name: 'Start Sync' });
    await fireEvent.click(submit);

    const saved = JSON.parse(localStorage.getItem('replicate-config') || '{}');
    expect(saved.url).toBe('https://example.com/ramit2');
    expect(saved.username).toBe('alice');
    expect(saved.password).toBeUndefined();

    // After submit, button should reflect syncing state, then status updates
    expect(screen.getByRole('button', { name: 'Syncing…' })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.body.textContent).toContain('Paused');
    });
  });

  it('shows error for invalid URL', async () => {
    render(Page);
    const urlInput = screen.getByLabelText('CouchDB URL') as HTMLInputElement;
    await fireEvent.input(urlInput, { target: { value: 'not a url' } });
    const submit = screen.getByRole('button', { name: 'Start Sync' });
    await fireEvent.click(submit);
    expect(document.body.textContent).toContain('Invalid URL');
  });
});
