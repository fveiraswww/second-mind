import { routes } from './src/api';
import { config } from './src/config';

Bun.serve({
  port: config.port,
  fetch(req: Request) {
    const url = new URL(req.url);

    if (url.pathname in routes) {
      const handler = routes[url.pathname as keyof typeof routes];
      return handler(req);
    }

    return new Response('404 Not Found', { status: 404 });
  },
});
