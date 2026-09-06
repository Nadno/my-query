import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { registerRoutes } from './routes';

const port = Number(process.env.PORT ?? 3001);

const app = Fastify({ logger: true });

app.setErrorHandler((err: unknown, request, reply) => {
  request.log.error(err);
  const e = err as { statusCode?: number; message?: string };
  const status = e.statusCode && e.statusCode >= 400 ? e.statusCode : 500;
  return reply.code(status).send({ error: e.message || 'Erro interno' });
});

await app.register(cookie);
await registerRoutes(app);

await app.listen({ port, host: '127.0.0.1' });
