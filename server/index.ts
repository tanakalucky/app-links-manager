import { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { csrf } from 'hono/csrf';
import { AppLink } from '~/types/app-link';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

app.use(csrf());

const route = app
  .get(
    '/app-links',
    cache({
      cacheName: 'app-links',
      cacheControl: 'max-age=10800',
    }),
    async (c) => {
      const { results } = await c.env.DB.prepare('SELECT * FROM app_links').all<AppLink>();

      return c.json(results);
    },
  )
  .post('/app-links/create', async (c) => {
    const { name, url } = await c.req.json<{ name: string; url: string }>();

    try {
      const result = await c.env.DB.prepare('INSERT INTO app_links (name, url) VALUES (?, ?) RETURNING *')
        .bind(name, url)
        .first<AppLink>();

      if (!result) {
        return c.json({ error: 'Failed to create link' }, 500);
      }

      return c.json(result);
    } catch (error) {
      console.error('Failed to create link:', error);
      return c.json({ error: 'Failed to create link' }, 500);
    }
  });

export default app;

export type AppType = typeof route;
