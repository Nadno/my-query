import type { CompanyType, Partner, ProfilePayload } from './types';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function passwordError(password: string): string | undefined {
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Za-z]/.test(password)) return 'Inclua ao menos uma letra';
  if (!/\d/.test(password)) return 'Inclua ao menos um número';
  return undefined;
}

export function shareSum(partners: { share: number }[]): number {
  return partners.reduce((sum, p) => sum + (Number.isFinite(p.share) ? p.share : 0), 0);
}

const TYPES: CompanyType[] = ['MEI', 'LTDA', 'SA'];

export function companyPayloadError(
  body: Partial<ProfilePayload> & { password?: string; confirmPassword?: string },
  opts: { requirePassword?: boolean } = {},
): string | undefined {
  if (!body.companyName?.trim()) return 'Informe a razão social';
  if (onlyDigits(body.cnpj ?? '').length !== 14) return 'CNPJ inválido';
  if (!body.companyType || !TYPES.includes(body.companyType)) return 'Tipo de empresa inválido';
  if (!body.email || !isEmail(body.email)) return 'E-mail corporativo inválido';

  const partners = body.partners;
  if (!partners?.length) return 'Inclua ao menos um sócio';
  if (body.companyType === 'MEI' && partners.length > 1) {
    return 'MEI permite apenas um sócio';
  }
  if (!partners.some((p) => p.isAdmin)) return 'Escolha um sócio administrador';
  const admins = partners.filter((p) => p.isAdmin);
  if (admins.length !== 1) return 'Deve haver exatamente um sócio administrador';

  for (const p of partners) {
    if (!p.name?.trim()) return 'Informe o nome de todos os sócios';
    if (onlyDigits(p.cpf ?? '').length !== 11) return 'CPF inválido';
  }

  const normalized: Partner[] = partners.map((p) => ({
    ...p,
    share: body.companyType === 'MEI' ? 100 : Number(p.share),
  }));
  if (body.companyType !== 'MEI' && Math.abs(shareSum(normalized) - 100) > 0.01) {
    return 'A soma das participações deve ser 100%';
  }

  if (opts.requirePassword) {
    const pw = body.password ?? '';
    const pwErr = passwordError(pw);
    if (pwErr) return pwErr;
    if (body.confirmPassword != null && pw !== body.confirmPassword) {
      return 'As senhas não coincidem';
    }
  }

  return undefined;
}
