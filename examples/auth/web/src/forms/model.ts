import { signal, type Signal } from '@preact/signals-core';
import type { CompanyType, Partner, UserPublic } from '../../../shared/types';
import type { FormApi } from '../composables/useForm';

export interface PartnerFields {
  id: string;
  name: Signal<string>;
  cpf: Signal<string>;
  share: Signal<string>;
  isAdmin: Signal<boolean>;
}

export type CompanyFormValues = {
  companyName: string;
  cnpj: string;
  companyType: CompanyType;
  email: string;
  partners: PartnerFields[];
};

export type RegisterFormValues = CompanyFormValues & {
  password: string;
  confirmPassword: string;
};

export type CompanyForm = FormApi<CompanyFormValues>;
export type RegisterForm = FormApi<RegisterFormValues>;

export function createPartner(partial?: Partial<Omit<Partner, 'share'>> & { share?: number | string }): PartnerFields {
  const share = partial?.share == null ? '' : String(partial.share);
  return {
    id: partial?.id ?? crypto.randomUUID(),
    name: signal(partial?.name ?? ''),
    cpf: signal(partial?.cpf ?? ''),
    share: signal(share),
    isAdmin: signal(partial?.isAdmin ?? false),
  };
}

export function snapshotPartners(
  partners: PartnerFields[],
  companyType: CompanyType,
): Partner[] {
  return partners.map((p, i) => ({
    id: p.id,
    name: p.name.value.trim(),
    cpf: p.cpf.value,
    share: companyType === 'MEI' ? 100 : Number(p.share.value) || 0,
    isAdmin: companyType === 'MEI' ? i === 0 : p.isAdmin.value,
  }));
}

export function partnersFromUser(user: UserPublic): PartnerFields[] {
  const list = user.partners.length
    ? user.partners
    : [{ id: crypto.randomUUID(), name: '', cpf: '', share: 100, isAdmin: true }];
  return list.map((p) => createPartner(p));
}

export function applyMeiConstraint(partners: Signal<PartnerFields[]>) {
  const first = partners.value[0];
  if (!first) {
    partners.value = [createPartner({ isAdmin: true, share: 100 })];
    return;
  }
  first.share.value = '100';
  first.isAdmin.value = true;
  partners.value = [first];
}
