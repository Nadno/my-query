import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { users } from './store';

const jwt = createRequire(import.meta.url)('jsonwebtoken') as typeof import('jsonwebtoken');

const scrypt = promisify(scryptCb);

export const JWT_SECRET = process.env.JWT_SECRET ?? 'mini-q-auth-dev-secret';
export const ACCESS_TTL_SEC = Number(process.env.ACCESS_TTL_SEC ?? 900);
export const REFRESH_TTL_SEC = Number(process.env.REFRESH_TTL_SEC ?? 86400);
export const COOKIE = 'refreshToken';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function signAccess(userId: string): string {
  return jwt.sign({ sub: userId, typ: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TTL_SEC });
}

export function signRefresh(userId: string, jti: string): string {
  return jwt.sign({ sub: userId, typ: 'refresh', jti }, JWT_SECRET, {
    expiresIn: REFRESH_TTL_SEC,
  });
}

export function setRefreshCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/api',
    secure: false,
    maxAge: REFRESH_TTL_SEC,
  });
}

export function clearRefreshCookie(reply: FastifyReply): void {
  reply.clearCookie(COOKIE, { path: '/api' });
}

interface AccessPayload {
  sub?: string;
  typ?: string;
}

export function readAccess(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AccessPayload;
    if (payload.typ !== 'access' || !payload.sub) return undefined;
    return users.has(payload.sub) ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

interface RefreshPayload {
  sub?: string;
  typ?: string;
  jti?: string;
}

export function readRefresh(token: string): RefreshPayload | undefined {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as RefreshPayload;
    if (payload.typ !== 'refresh' || !payload.sub || !payload.jti) return undefined;
    return payload;
  } catch {
    return undefined;
  }
}
