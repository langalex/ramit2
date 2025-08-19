import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import process from 'node:process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: { adapter: adapter() },
  compilerOptions: {
    runes: true
  },
  base: process.env.NODE_ENV === 'production' ? '/ramit2' : ''
};

export default config;
