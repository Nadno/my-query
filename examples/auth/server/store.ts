import { randomUUID } from 'node:crypto';
import type { CompanyType, Partner, UserPublic } from '../shared/types';

export interface UserRecord {
  id: string;
  email: string;
  companyName: string;
  cnpj: string;
  companyType: CompanyType;
  partners: Partner[];
  passwordHash: string;
}

export const users = new Map<string, UserRecord>();
export const emailIndex = new Map<string, string>();
export const refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

export function publicUser(u: UserRecord): UserPublic {
  return {
    id: u.id,
    email: u.email,
    companyName: u.companyName,
    cnpj: u.cnpj,
    companyType: u.companyType,
    partners: u.partners,
  };
}

export function findByEmail(email: string): UserRecord | undefined {
  const id = emailIndex.get(email.trim().toLowerCase());
  return id ? users.get(id) : undefined;
}

export function createUser(input: Omit<UserRecord, 'id'>): UserRecord {
  const id = randomUUID();
  const record: UserRecord = { ...input, id, email: input.email.trim().toLowerCase() };
  users.set(id, record);
  emailIndex.set(record.email, id);
  return record;
}

export function updateUser(id: string, patch: Partial<Omit<UserRecord, 'id' | 'passwordHash'>>): UserRecord | undefined {
  const current = users.get(id);
  if (!current) return undefined;
  if (patch.email && patch.email !== current.email) {
    emailIndex.delete(current.email);
    emailIndex.set(patch.email.trim().toLowerCase(), id);
  }
  const next: UserRecord = {
    ...current,
    ...patch,
    email: (patch.email ?? current.email).trim().toLowerCase(),
  };
  users.set(id, next);
  return next;
}

export function issueRefresh(userId: string, ttlMs: number): string {
  const jti = randomUUID();
  refreshTokens.set(jti, { userId, expiresAt: Date.now() + ttlMs });
  return jti;
}

export function consumeRefresh(jti: string): string | undefined {
  const rec = refreshTokens.get(jti);
  refreshTokens.delete(jti);
  if (!rec || rec.expiresAt < Date.now()) return undefined;
  return rec.userId;
}

export function revokeRefresh(jti: string): void {
  refreshTokens.delete(jti);
}
