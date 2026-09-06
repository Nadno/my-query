import { signal } from '@preact/signals-core';
import $ from 'mini-q';
import { ApiError } from '../api';
import { screen, useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { authGate, card, form } from '../ui/theme';

export function Login() {
  const auth = useAuth();
  const toast = useToast();
  const email = signal('');
  const password = signal('');
  const submitting = signal(false);

  const submit = async (e: Event) => {
    e.preventDefault();
    submitting.value = true;
    try {
      await auth.login(email.value, password.value);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha no login');
    } finally {
      submitting.value = false;
    }
  };

  return $.div(
    { class: card.root },
    $.h1({ class: card.title }, 'Entrar'),
    $.p({ class: card.muted }, 'Sessão JWT com refresh em cookie.'),
    $.form(
      { class: form.root, on: { submit: [submit, $.handle.prevent] } },
      Field({
        label: 'E-mail',
        control: TextInput({
          value: email,
          type: 'email',
          autocomplete: 'username',
          placeholder: 'contato@empresa.com',
        }),
      }),
      Field({
        label: 'Senha',
        control: TextInput({
          value: password,
          type: 'password',
          autocomplete: 'current-password',
        }),
      }),
      Button({
        type: 'submit',
        label: 'Entrar',
        disabled: () => submitting.value,
      }),
    ),
    $.p(
      { class: authGate.switch },
      'Não tem conta? ',
      $.button(
        {
          class: authGate.link,
          type: 'button',
          on: { click: () => (screen.value = 'register') },
        },
        'Cadastrar empresa',
      ),
    ),
  );
}
