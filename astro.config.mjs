// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Static-first: las 16 páginas de marketing viven en public/ y se sirven tal cual.
// Las rutas de src/pages/** (login, dashboard, api) usan `export const prerender = false`
// para renderizarse bajo demanda en Vercel (runtime Node, por Prisma).
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  // No procesamos las páginas de marketing: están en public/, intactas.
});
