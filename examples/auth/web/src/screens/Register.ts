import { signal } from '@preact/signals-core';
import $ from 'mini-q';
import { ApiError } from '../api';
import { screen, useAuth } from '../composables/useAuth';
import { useAsyncValidator } from '../composables/useAsyncValidator';
import { useForm } from '../composables/useForm';
import { useToast } from '../composables/useToast';
import { AccessFields } from '../forms/AccessFields';
import { checkEmail } from '../forms/checkEmail';
import { CompanyFields } from '../forms/CompanyFields';
import { createPartner, snapshotPartners, type RegisterFormValues } from '../forms/model';
import { PartnersFields } from '../forms/PartnersFields';
import { validateStep } from '../forms/validate';
import { Button } from '../ui/Button';
import { Stepper } from '../ui/Stepper';
import { authGate, card, form } from '../ui/theme';

export function Register() {
  const auth = useAuth();
  const toast = useToast();
  const step = signal(0);
  const submitting = signal(false);
  const formApi = useForm<RegisterFormValues>(
    {
      companyName: '',
      cnpj: '',
      companyType: 'LTDA',
      email: '',
      partners: [createPartner({ isAdmin: true, share: 100 })],
      password: '',
      confirmPassword: '',
    },
    (v) => validateStep(step.value, v),
  );
  const emailAsync = useAsyncValidator(formApi.fields.email, checkEmail);

  const canAdvance = () => {
    const errs = validateStep(step.value, formApi.values.value, {
      emailAsync: emailAsync.error.value,
    });
    if (Object.keys(errs).length) return false;
    if (step.value === 0 && (emailAsync.loading.value || emailAsync.error.value)) return false;
    return true;
  };

  const goNext = () => {
    const errs = validateStep(step.value, formApi.values.value, {
      emailAsync: emailAsync.error.value,
    });
    formApi.errors.value = errs;
    formApi.touched.value = { ...formApi.touched.value, companyName: true, cnpj: true, email: true };
    if (Object.keys(errs).length) return;
    if (step.value === 0 && (emailAsync.loading.value || emailAsync.error.value)) return;
    step.value += 1;
  };

  const submit = formApi.submit(async (values) => {
    submitting.value = true;
    try {
      await auth.register({
        companyName: values.companyName.trim(),
        cnpj: values.cnpj,
        companyType: values.companyType,
        email: values.email.trim(),
        partners: snapshotPartners(values.partners, values.companyType),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha no cadastro');
    } finally {
      submitting.value = false;
    }
  });

  return $.div(
    { class: card },
    $.h1({ class: card.title }, 'Cadastrar empresa'),
    $.p({ class: card.muted }, 'PJ multi-step — os mesmos campos são reusados na área interna.'),
    Stepper({
      step: () => step.value,
      labels: ['Empresa', 'Sócios', 'Acesso'],
    }),
    $.form(
      { class: form, on: { submit: [submit, $.handle.prevent] } },
      $.when(
        () => step.value === 0,
        () => CompanyFields({ form: formApi, emailAsync }),
      ),
      $.when(
        () => step.value === 1,
        () =>
          PartnersFields({
            partners: formApi.fields.partners,
            companyType: formApi.fields.companyType,
            errors: formApi.errors,
            touched: formApi.touched,
            touch: formApi.touch,
          }),
      ),
      $.when(
        () => step.value === 2,
        () => AccessFields({ form: formApi }),
      ),
      $.div(
        { class: form.actions },
        $.when(
          () => step.value > 0,
          () =>
            Button({
              variant: 'ghost',
              label: 'Voltar',
              onClick: () => {
                step.value -= 1;
              },
            }),
        ),
        $.when(
          () => step.value < 2,
          () =>
            Button({
              label: 'Continuar',
              disabled: () => !canAdvance(),
              onClick: goNext,
            }),
          () =>
            Button({
              type: 'submit',
              label: 'Criar conta',
              disabled: () => submitting.value || !canAdvance(),
            }),
        ),
      ),
    ),
    $.p(
      { class: authGate.self },
      'Já tem conta? ',
      $.button(
        {
          class: authGate.link,
          type: 'button',
          on: { click: () => (screen.value = 'login') },
        },
        'Entrar',
      ),
    ),
  );
}
