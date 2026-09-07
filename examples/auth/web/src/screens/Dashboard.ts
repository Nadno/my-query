import { signal } from '@preact/signals-core';
import $ from 'mini-q';
import { ApiError } from '../api';
import { useAuth } from '../composables/useAuth';
import { useAsyncValidator } from '../composables/useAsyncValidator';
import { useForm } from '../composables/useForm';
import { usePopover } from '../composables/usePopover';
import { useToast } from '../composables/useToast';
import { checkEmail } from '../forms/checkEmail';
import { CompanyFields } from '../forms/CompanyFields';
import {
  partnersFromUser,
  snapshotPartners,
  type CompanyFormValues,
} from '../forms/model';
import { PartnersFields } from '../forms/PartnersFields';
import { validateCompany } from '../forms/validate';
import { Button } from '../ui/Button';
import { Popover } from '../ui/Popover';
import { card, form, header } from '../ui/theme';

export function Dashboard() {
  const auth = useAuth();
  const toast = useToast();
  const pop = usePopover();
  const current = auth.user.value;
  if (!current) return $.div({}, 'Carregando…');

  const formApi = useForm<CompanyFormValues>(
    {
      companyName: current.companyName,
      cnpj: current.cnpj,
      companyType: current.companyType,
      email: current.email,
      partners: partnersFromUser(current),
    },
    (v) => validateCompany(v),
  );
  const emailAsync = useAsyncValidator(formApi.fields.email, checkEmail);
  const saving = signal(false);

  const save = formApi.submit(async (values) => {
    if (emailAsync.loading.value || emailAsync.error.value) return;
    saving.value = true;
    try {
      await auth.updateMe({
        companyName: values.companyName.trim(),
        cnpj: values.cnpj,
        companyType: values.companyType,
        email: values.email.trim(),
        partners: snapshotPartners(values.partners, values.companyType),
      });
      toast.success('Perfil atualizado');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao salvar');
    } finally {
      saving.value = false;
    }
  });

  return $.div(
    { class: form },
    $.header(
      { class: header },
      $.div(
        {},
        $.h1({ class: header.title }, () => auth.user.value?.companyName ?? ''),
        $.p({ class: header.subtitle }, 'Área interna'),
      ),
      Popover({
        hostOn: pop.on,
        hostUse: pop.use,
        open: () => pop.open.value,
        trigger: Button({
          variant: 'ghost',
          size: 'sm',
          onClick: pop.toggle,
          label: () => auth.user.value?.email ?? 'Menu',
        }),
        panel: () =>
          Button({
            variant: 'danger',
            size: 'sm',
            onClick: () => void auth.logout(),
            label: 'Sair',
          }),
      }),
    ),
    $.section(
      { class: card },
      $.h2({ class: card.title }, 'Empresa'),
      $.p(
        { class: card.muted },
        () =>
          `${auth.user.value?.companyType ?? ''} · ${auth.user.value?.cnpj ?? ''} · ${auth.user.value?.email ?? ''}`,
      ),
      $.p(
        { class: card.muted },
        () => {
          const partners = auth.user.value?.partners ?? [];
          const admin = partners.find((p) => p.isAdmin);
          return `${partners.length} sócio(s)${admin ? ` · admin: ${admin.name}` : ''}`;
        },
      ),
    ),
    $.section(
      { class: card },
      $.h2({ class: card.title }, 'Editar perfil'),
      $.p({ class: card.muted }, 'Reusa os mesmos campos do cadastro.'),
      $.form(
        { class: form, on: { submit: [save, $.handle.prevent] } },
        CompanyFields({ form: formApi, emailAsync }),
        PartnersFields({
          partners: formApi.fields.partners,
          companyType: formApi.fields.companyType,
          errors: formApi.errors,
          touched: formApi.touched,
          touch: formApi.touch,
        }),
        $.div(
          { class: form.actions },
          Button({
            type: 'submit',
            label: 'Salvar alterações',
            disabled: () =>
              saving.value ||
              !formApi.isValid.value ||
              emailAsync.loading.value ||
              !!emailAsync.error.value,
          }),
        ),
      ),
    ),
  );
}
