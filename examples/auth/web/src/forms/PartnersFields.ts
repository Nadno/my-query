import $ from 'mini-q';
import { $when } from 'mini-q';
import type { Signal } from '@preact/signals-core';
import { maskCpf, maskPercent } from '../composables/$useMask';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { sForm } from '../ui/shell.style';
import sField from '../ui/Field.style';
import { sPartnerRow } from './PartnersFields.style';
import { createPartner, type PartnerFields } from './model';
import type { CompanyType } from '../../../shared/types';

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
    { class: sPartnerRow },
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
    $when(
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
        $class: () => sPartnerRow.admin({ on: p.partner.isAdmin.value }),
        on: { click: setAdmin },
      },
      () => (p.partner.isAdmin.value ? 'Administrador' : 'Tornar admin'),
    ),
    $when(
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
    { class: sForm },
    $.ul({ class: sForm, style: { listStyle: 'none', margin: '0', padding: '0' } }, () =>
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
    $when(
      () => p.companyType.value !== 'MEI',
      () => Button({ variant: 'ghost', size: 'sm', onClick: add, label: '+ Sócio' }),
    ),
    $when(
      () =>
        !!(p.errors.value.partners || p.errors.value.partnersShare || p.errors.value.partnersAdmin),
      () =>
        $.p(
          { class: sField.error },
          () =>
            p.errors.value.partnersShare ??
            p.errors.value.partnersAdmin ??
            p.errors.value.partners ??
            '',
        ),
    ),
  );
}
