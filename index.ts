import { routes } from './routes';

Bun.serve({
  port: 8080,
  fetch(req: Request) {
    const url = new URL(req.url);

    if (url.pathname in routes) {
      const handler = routes[url.pathname as keyof typeof routes];
      return handler(req);
    }

    return new Response('404!', { status: 404 });
  },
});
