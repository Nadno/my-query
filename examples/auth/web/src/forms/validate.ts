import { isEmail, onlyDigits, passwordError, shareSum } from '../../../shared/validate';
import type { CompanyFormValues, RegisterFormValues } from './model';

export function validateCompany(values: CompanyFormValues, opts?: { emailAsync?: string | null }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.companyName.trim()) errors.companyName = 'Informe a razão social';
  if (onlyDigits(values.cnpj).length !== 14) errors.cnpj = 'CNPJ incompleto';
  if (!isEmail(values.email)) errors.email = 'E-mail inválido';
  else if (opts?.emailAsync) errors.email = opts.emailAsync;

  const partners = values.partners;
  if (partners.length < 1) errors.partners = 'Inclua ao menos um sócio';
  if (values.companyType === 'MEI' && partners.length > 1) {
    errors.partners = 'MEI permite apenas um sócio';
  }

  let adminCount = 0;
  for (const p of partners) {
    if (!p.name.value.trim()) errors[`partners.${p.id}.name`] = 'Informe o nome';
    if (onlyDigits(p.cpf.value).length !== 11) errors[`partners.${p.id}.cpf`] = 'CPF incompleto';
    if (p.isAdmin.value) adminCount += 1;
    if (values.companyType !== 'MEI') {
      const n = Number(p.share.value);
      if (p.share.value === '' || Number.isNaN(n) || n <= 0) {
        errors[`partners.${p.id}.share`] = 'Informe a participação';
      }
    }
  }
  if (partners.length && adminCount !== 1) {
    errors.partnersAdmin = 'Escolha exatamente um administrador';
  }
  if (values.companyType !== 'MEI' && partners.length) {
    const sum = shareSum(
      partners.map((p) => ({ share: Number(p.share.value) || 0 })),
    );
    if (Math.abs(sum - 100) > 0.01) {
      errors.partnersShare = `A soma das participações deve ser 100% (atual: ${sum}%)`;
    }
  }
  return errors;
}

export function validateRegister(
  values: RegisterFormValues,
  opts?: { emailAsync?: string | null },
): Record<string, string> {
  const errors = validateCompany(values, opts);
  const pw = passwordError(values.password);
  if (pw) errors.password = pw;
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem';
  }
  return errors;
}

export function validateStep(
  step: number,
  values: RegisterFormValues,
  opts?: { emailAsync?: string | null },
): Record<string, string> {
  const all = validateRegister(values, opts);
  if (step === 0) {
    return pick(all, ['companyName', 'cnpj', 'email']);
  }
  if (step === 1) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(all)) {
      if (k.startsWith('partners')) out[k] = v;
    }
    return out;
  }
  return pick(all, ['password', 'confirmPassword']);
}

function pick(src: Record<string, string>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = src[k];
    if (v) out[k] = v;
  }
  return out;
}
