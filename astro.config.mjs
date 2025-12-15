// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import astroIcon from 'astro-icon';
import mdx from '@astrojs/mdx';
import netlify from "@astrojs/netlify";
import { fileURLToPath } from 'url';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  output: 'static', // Important pour Netlify
  adapter: netlify({
    // Configuration pour Netlify
    dist: new URL('./dist/', import.meta.url)
  }),
  integrations: [
    tailwind(),
    mdx(),
    astroIcon({
      include: {
        mdi: ["*"],
        ri: ['*'],
        'simple-icons': ['*'],
      },
    })
  ],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src'),
        '@components': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src/components'),
        '@layouts': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src/layouts'),
      }
    }
  },
  build: {
    format: 'file',
    assets: '_astro',
    server: '.netlify/functions-internal/',
    client: 'dist/'
  }
});
