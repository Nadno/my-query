import { signal } from '@preact/signals-core';
import $ from 'mini-q';
import { $handle } from 'mini-q';
import { ApiError } from '../api';
import { useAuth } from '../composables/useAuth';
import { Spinner } from '../ui/Spinner';
import { useAsyncValidator } from '../composables/useAsyncValidator';
import { useForm } from '../composables/useForm';
import $usePopover from '../composables/$usePopover';
import { $useModal } from '../composables/$useModal';
import { Modal } from '../ui/Modal';
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
import { Tabs } from '../ui/Tabs';
import { Accordion } from '../ui/Accordion';
import { Settings } from './Settings';
import { sCard, sForm, sHeader } from '../ui/shell.style';

export function Dashboard() {
  const auth = useAuth();
  const toast = useToast();
  const pop = $usePopover();
  const confirmLogout = $useModal();
  const current = auth.user.value;
  if (!current)
    return $.div(
      { class: sCard },
      $.p(
        { style: 'display:flex;align-items:center;gap:var(--space-md)' },
        [Spinner, {}],
        'Carregando…',
      ),
    );

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

  const companySummary = () =>
    `${current.companyType} · ${current.cnpj} · ${current.email}`;
  const admin = current.partners.find((p) => p.isAdmin);
  const partnerCount = () =>
    `${current.partners.length} sócio(s)${admin ? ` · admin: ${admin.name}` : ''}`;

  return $.div(
    { class: sForm },
    $.header(
      { class: sHeader },
      $.div(
        {},
        $.h1({ class: sHeader.title }, () => auth.user.value?.companyName ?? ''),
        $.p({ class: sHeader.subtitle }, 'Área interna'),
      ),
      Popover({
        hostOn: pop.on,
        hostUse: pop.use,
        open: () => pop.open.value,
        onClose: pop.close,
        triggerId: 'user-menu-trigger',
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
            onClick: () => confirmLogout.show(),
            label: 'Sair',
          }),
      }),
    ),
    Tabs({
      initial: 'company',
      items: [
        {
          id: 'company',
          label: 'Empresa',
          content: $.div(
            {},
            $.section(
              { class: sCard },
              $.h2({ class: sCard.title }, 'Dados cadastrais'),
              $.p({ class: sCard.muted }, companySummary),
              $.p({ class: sCard.muted }, partnerCount),
            ),
            Accordion({
              single: true,
              initial: [],
              items: current.partners.map((p, i) => ({
                id: `partner-${i}`,
                title: `${p.name}${p.isAdmin ? ' (admin)' : ''}`,
                content: $.div(
                  {},
                  $.p({}, `CPF: ${p.cpf}`),
                  $.p({}, `Participação: ${p.share}%`),
                ),
              })),
            }),
          ),
        },
        {
          id: 'profile',
          label: 'Editar perfil',
          content: $.section(
            { class: sCard },
            $.h2({ class: sCard.title }, 'Editar perfil'),
            $.p({ class: sCard.muted }, 'Reusa os mesmos campos do cadastro.'),
            $.form(
              { class: sForm, on: { submit: [save, $handle.prevent] } },
              CompanyFields({ form: formApi, emailAsync }),
              PartnersFields({
                partners: formApi.fields.partners,
                companyType: formApi.fields.companyType,
                errors: formApi.errors,
                touched: formApi.touched,
                touch: formApi.touch,
              }),
              $.div(
                { class: sForm.actions },
                Button({
                  type: 'submit',
                  label: 'Salvar alterações',
                  disabled: () =>
                    !formApi.isValid.value ||
                    emailAsync.loading.value ||
                    !!emailAsync.error.value,
                  loading: () => saving.value,
                }),
              ),
            ),
          ),
        },
        {
          id: 'settings',
          label: 'Configurações',
          content: Settings(),
        },
      ],
    }),
    Modal({
      open: confirmLogout.open,
      title: 'Sair da conta',
      onClose: () => confirmLogout.hide(),
      children: $.p({ style: 'margin:0' }, 'Tem certeza que deseja sair?'),
      actions: [
        Button({
          variant: 'ghost',
          label: 'Cancelar',
          onClick: () => confirmLogout.hide(),
        }),
        Button({
          variant: 'danger',
          label: 'Sair',
          onClick: () => void auth.logout(),
        }),
      ],
    }),
  );
}
