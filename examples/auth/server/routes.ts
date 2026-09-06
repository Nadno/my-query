import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { AuthResponse, ProfilePayload, RegisterPayload, UserPublic } from '../shared/types';
import { companyPayloadError } from '../shared/validate';
import {
  ACCESS_TTL_SEC,
  COOKIE,
  clearRefreshCookie,
  hashPassword,
  readAccess,
  readRefresh,
  REFRESH_TTL_SEC,
  setRefreshCookie,
  signAccess,
  signRefresh,
  verifyPassword,
} from './auth';
import {
  consumeRefresh,
  createUser,
  findByEmail,
  issueRefresh,
  publicUser,
  revokeRefresh,
  updateUser,
  users,
} from './store';

function error(reply: FastifyReply, status: number, message: string) {
  return reply.code(status).send({ error: message });
}

function requireUser(request: FastifyRequest, reply: FastifyReply) {
  const userId = readAccess(request);
  if (!userId) {
    error(reply, 401, 'Sessão expirada. Faça login novamente.');
    return undefined;
  }
  const user = users.get(userId);
  if (!user) {
    error(reply, 401, 'Sessão expirada. Faça login novamente.');
    return undefined;
  }
  return user;
}

function normalizePartners(body: ProfilePayload): ProfilePayload['partners'] {
  return body.partners.map((p) => ({
    ...p,
    name: p.name.trim(),
    share: body.companyType === 'MEI' ? 100 : Number(p.share),
    isAdmin: body.companyType === 'MEI' ? true : p.isAdmin,
  }));
}

function issueSession(reply: FastifyReply, userId: string): AuthResponse {
  const user = users.get(userId);
  if (!user) throw new Error('user missing');
  const jti = issueRefresh(userId, REFRESH_TTL_SEC * 1000);
  setRefreshCookie(reply, signRefresh(userId, jti));
  return {
    accessToken: signAccess(userId),
    expiresIn: ACCESS_TTL_SEC,
    user: publicUser(user),
  };
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/email-available', async (request, reply) => {
    const raw = (request.query as { email?: string | string[] }).email;
    const email = String(Array.isArray(raw) ? raw[0] : (raw ?? ''))
      .trim()
      .toLowerCase();
    if (!email) {
      return reply.send({ available: false, error: 'Informe o e-mail' });
    }
    const existing = findByEmail(email);
    const me = readAccess(request);
    const available = !existing || existing.id === me;
    if (available) return reply.send({ available: true });
    return reply.send({ available: false, error: 'E-mail já cadastrado' });
  });

  app.post('/api/register', async (request, reply) => {
    const body = (request.body ?? {}) as RegisterPayload;
    const invalid = companyPayloadError(body, { requirePassword: true });
    if (invalid) return error(reply, 400, invalid);
    if (findByEmail(body.email)) return error(reply, 409, 'E-mail já cadastrado');

    const record = createUser({
      email: body.email,
      companyName: body.companyName.trim(),
      cnpj: body.cnpj,
      companyType: body.companyType,
      partners: normalizePartners(body),
      passwordHash: await hashPassword(body.password),
    });
    return reply.code(201).send({ user: publicUser(record) });
  });

  app.post('/api/login', async (request, reply) => {
    const body = (request.body ?? {}) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';
    const user = findByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return error(reply, 401, 'E-mail ou senha inválidos');
    }
    return reply.send(issueSession(reply, user.id));
  });

  app.post('/api/refresh', async (request, reply) => {
    const token = request.cookies[COOKIE];
    if (!token) return error(reply, 401, 'Sessão expirada. Faça login novamente.');
    const payload = readRefresh(token);
    if (!payload?.jti || !payload.sub) {
      clearRefreshCookie(reply);
      return error(reply, 401, 'Sessão expirada. Faça login novamente.');
    }
    const userId = consumeRefresh(payload.jti);
    if (!userId || userId !== payload.sub || !users.has(userId)) {
      clearRefreshCookie(reply);
      return error(reply, 401, 'Sessão expirada. Faça login novamente.');
    }
    return reply.send(issueSession(reply, userId));
  });

  app.post('/api/logout', async (request, reply) => {
    const token = request.cookies[COOKIE];
    if (token) {
      const payload = readRefresh(token);
      if (payload?.jti) revokeRefresh(payload.jti);
    }
    clearRefreshCookie(reply);
    return reply.send({ ok: true });
  });

  app.get('/api/me', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    return reply.send(publicUser(user));
  });

  app.put('/api/me', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const body = (request.body ?? {}) as ProfilePayload;
    const invalid = companyPayloadError(body);
    if (invalid) return error(reply, 400, invalid);
    const email = body.email.trim().toLowerCase();
    const clash = findByEmail(email);
    if (clash && clash.id !== user.id) return error(reply, 409, 'E-mail já cadastrado');
    const next = updateUser(user.id, {
      email,
      companyName: body.companyName.trim(),
      cnpj: body.cnpj,
      companyType: body.companyType,
      partners: normalizePartners(body),
    });
    return reply.send(publicUser(next!));
  });
}
