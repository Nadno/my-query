import $ from 'mini-q';
import type { Signal } from '@preact/signals-core';
import { maskCpf, maskPercent } from '../composables/useMask';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { form } from '../ui/theme';
import { fieldStyle } from '../ui/Field';
import { createPartner, type PartnerFields } from './model';
import type { CompanyType } from '../../../shared/types';

const row = $.style('partner-row', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr auto auto',
  gap: '.75rem',
  alignItems: 'end',
  padding: '1rem',
  background: 'rgba(255,255,255,.03)',
  borderRadius: 12,
  border: '1px solid var(--line)',
  '@media (max-width: 720px)': { gridTemplateColumns: '1fr' },
  parts: {
    admin: {
      display: 'flex',
      alignItems: 'center',
      gap: '.4rem',
      fontSize: '.85rem',
      padding: '.5rem .75rem',
      whiteSpace: 'nowrap',
      background: 'transparent',
      color: 'inherit',
      border: '1px solid var(--line)',
      borderRadius: 8,
      cursor: 'pointer',
      flags: {
        on: { borderColor: 'rgba(102,126,234,.6)', background: 'rgba(102,126,234,.15)' },
      },
    },
  },
});

export function PartnerRow(p: {
  partner: PartnerFields;
  partners: Signal<PartnerFields[]>;
  companyType: Signal<CompanyType>;
  errors: Signal<Record<string, string>>;
  touched: Signal<Record<string, boolean>>;
  touch: (name: string) => void;
  key?: string;
}) {
  const id = p.partner.id;
  const isMei = () => p.companyType.value === 'MEI';
  const err = (field: string) => {
    const key = `partners.${id}.${field}`;
    return p.touched.value[key] ? (p.errors.value[key] ?? '') : '';
  };

  const setAdmin = () => {
    for (const x of p.partners.value) x.isAdmin.value = x.id === id;
  };

  const remove = () => {
    if (p.partners.value.length <= 1) return;
    const next = p.partners.value.filter((x) => x.id !== id);
    if (!next.some((x) => x.isAdmin.value) && next[0]) next[0].isAdmin.value = true;
    p.partners.value = next;
  };

  return $.div(
    { class: row },
    Field({
      label: 'Nome',
      error: () => err('name'),
      control: TextInput({
        value: p.partner.name,
        placeholder: 'Nome completo',
        onBlur: () => p.touch(`partners.${id}.name`),
      }),
    }),
    Field({
      label: 'CPF',
      error: () => err('cpf'),
      control: TextInput({
        value: p.partner.cpf,
        placeholder: '000.000.000-00',
        mask: maskCpf,
        onBlur: () => p.touch(`partners.${id}.cpf`),
      }),
    }),
    $.when(
      () => !isMei(),
      () =>
        Field({
          label: '% participação',
          error: () => err('share'),
          control: TextInput({
            value: p.partner.share,
            placeholder: '0–100',
            mask: maskPercent,
            onBlur: () => p.touch(`partners.${id}.share`),
          }),
        }),
    ),
    $.button(
      {
        type: 'button',
        $class: () => row.admin({ on: p.partner.isAdmin.value }),
        on: { click: setAdmin },
      },
      () => (p.partner.isAdmin.value ? 'Administrador' : 'Tornar admin'),
    ),
    $.when(
      () => !isMei() && p.partners.value.length > 1,
      () =>
        Button({
          variant: 'danger',
          size: 'sm',
          onClick: remove,
          label: 'Remover',
        }),
    ),
  );
}

export function PartnersFields(p: {
  partners: Signal<PartnerFields[]>;
  companyType: Signal<CompanyType>;
  errors: Signal<Record<string, string>>;
  touched: Signal<Record<string, boolean>>;
  touch: (name: string) => void;
}) {
  const add = () => {
    if (p.companyType.value === 'MEI') return;
    p.partners.value = [...p.partners.value, createPartner()];
  };

  return $.div(
    { class: form },
    $.ul({ class: form, style: { listStyle: 'none', margin: 0, padding: 0 } }, () =>
      p.partners.value.map(
        (partner) =>
          [
            PartnerRow,
            {
              partner,
              partners: p.partners,
              companyType: p.companyType,
              errors: p.errors,
              touched: p.touched,
              touch: p.touch,
              key: partner.id,
            },
          ] as [
            typeof PartnerRow,
            {
              partner: PartnerFields;
              partners: Signal<PartnerFields[]>;
              companyType: Signal<CompanyType>;
              errors: Signal<Record<string, string>>;
              touched: Signal<Record<string, boolean>>;
              touch: (name: string) => void;
              key: string;
            },
          ],
      ),
    ),
    $.when(
      () => p.companyType.value !== 'MEI',
      () => Button({ variant: 'ghost', size: 'sm', onClick: add, label: '+ Sócio' }),
    ),
    $.when(
      () => !!(p.errors.value.partners || p.errors.value.partnersShare || p.errors.value.partnersAdmin),
      () =>
        $.p(
          { class: fieldStyle.error },
          () =>
            p.errors.value.partnersShare ??
            p.errors.value.partnersAdmin ??
            p.errors.value.partners ??
            '',
        ),
    ),
  );
}
