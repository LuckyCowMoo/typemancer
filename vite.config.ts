import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function typemancerJsonWriter(): Plugin {
  const devApiMiddleware = (req: any, res: any, next: any) => {
    const url = req.url ? req.url.split('?')[0] : '';
    if (url === '/__dev_api/save-json') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }

      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const { fileName, data } = JSON.parse(body);

          const allowed = [
            'enemies.json',
            'cards.json',
            'relics.json',
            'events.json',
            'environments.json',
            'map_phrases.json',
          ];

          if (!fileName || !allowed.includes(fileName)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Invalid fileName. Must be one of: ${allowed.join(', ')}` }));
            return;
          }

          const targetPath = path.resolve(import.meta.dirname, 'src/data', fileName);
          fs.writeFileSync(targetPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, path: 'src/data/' + fileName }));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to parse JSON body';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
      return;
    }

    next();
  };

  return {
    name: 'typemancer-json-writer',
    configureServer(server) {
      server.middlewares.use(devApiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(devApiMiddleware);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), typemancerJsonWriter()],
})
