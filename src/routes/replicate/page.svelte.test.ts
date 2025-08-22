import { describe, it, expect, beforeEach, vi } from 'vitest';
// Mock pouchdb-browser to avoid real network calls and provide minimal API used by the app
vi.mock('pouchdb-browser', () => {
  class FakePouchDB {
    static plugin = vi.fn();
    name: string;
    constructor(nameOrUrl: string) {
      this.name = String(nameOrUrl);
    }
    sync() {
      const handlers: Record<string, Array<() => void>> = {};
      const api = {
        on(event: string, cb: () => void) {
          (handlers[event] ||= []).push(cb);
          return api;
        },
        cancel: vi.fn()
      };
      queueMicrotask(() => {
        handlers['active']?.forEach((fn) => fn());
        handlers['paused']?.forEach((fn) => fn());
      });
      return api;
    }
  }
  return { default: FakePouchDB };
});

import Page from './+page.svelte';
import { render } from 'vitest-browser-svelte';
import { screen, fireEvent, waitFor } from '@testing-library/dom';

describe('Replicate Page', () => {
  beforeEach(async () => {
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

  it('shows error for empty URL', async () => {
    render(Page);
    const submit = screen.getByRole('button', { name: 'Start Sync' });
    await fireEvent.click(submit);
    expect(screen.getByText('Please enter a CouchDB URL')).toBeInTheDocument();
  });

  it('handles sync errors gracefully', async () => {
    // Mock PouchDB to simulate an error
    const mockPouchDB = vi.mocked(await import('pouchdb-browser')).default;
    const mockSync = {
      on: vi.fn(),
      cancel: vi.fn()
    };

    // Override the sync method to simulate an error
    const originalSync = mockPouchDB.prototype.sync;
    mockPouchDB.prototype.sync = vi.fn().mockReturnValue(mockSync);

    // Simulate error event
    mockSync.on.mockImplementation((event, callback) => {
      if (event === 'error') {
        // Trigger error immediately
        setTimeout(() => callback(new Error('Connection failed')), 0);
      }
      return mockSync;
    });

    render(Page);

    const urlInput = screen.getByLabelText('CouchDB URL') as HTMLInputElement;
    await fireEvent.input(urlInput, { target: { value: 'https://invalid.couchdb.com/ramit2' } });

    const submit = screen.getByRole('button', { name: 'Start Sync' });
    await fireEvent.click(submit);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
    });

    // Restore original mock
    mockPouchDB.prototype.sync = originalSync;
  });
});
