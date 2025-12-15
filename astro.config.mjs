// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import astroIcon from 'astro-icon';
import mdx from '@astrojs/mdx';
import vercel from "@astrojs/vercel/serverless";
import { fileURLToPath } from 'url';
import path from 'path';

// https://astro.build/config
export default defineConfig({
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
  output: 'server',
  adapter: vercel({
    // Configuration minimale pour Vercel
    webAnalytics: {
      enabled: true
    }
  })
});
