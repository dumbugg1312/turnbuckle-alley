import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

// Every HTML file in mockups/ is built as its own page alongside the game.
const mockups = Object.fromEntries(
  readdirSync('mockups')
    .filter((f) => f.endsWith('.html'))
    .map((f) => [`mockups/${f.replace('.html', '')}`, resolve('mockups', f)]),
);

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: { main: resolve('index.html'), ...mockups },
    },
  },
  // No HMR: several people edit files at once, and auto-reloads break playtests.
  server: { host: true, hmr: false },
});
