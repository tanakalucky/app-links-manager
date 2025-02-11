import { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { AppLink } from '~/types/app-link';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

const route = app.get('/app-links', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM app_links').all<AppLink>();

  return c.json(results);
});

export default app;

export type AppType = typeof route;
