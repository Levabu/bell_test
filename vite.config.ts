import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// base: './' so the build works from any sub-path (GitHub Pages, Vercel, StackBlitz).
export default defineConfig({
  base: './',
  plugins: [svelte()],
})
