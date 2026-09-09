import { signal } from '@preact/signals-core';
import $ from 'mini-q';
import { $handle } from 'mini-q';
import { ApiError } from '../api';
import { screen, useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';
import { Button } from '../ui/Button';
import { Carousel } from '../ui/Carousel';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { sAuthGate, sCard, sForm } from '../ui/shell.style';
import { sLoginHero, sLoginLayout, sTestimonialCard } from './Login.style';
import { testimonials } from './LoginTestimonials';

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
    { class: sLoginLayout },
    $.div(
      { class: sLoginHero },
      $.div(
        {},
        $.h1({ class: sLoginHero.brand }, 'mini-q auth'),
        $.p(
          { class: sLoginHero.pitch },
          'Exemplo completo de autenticação JWT com cadastro multi-step, signals granulares e estilos reativos — sem build e sem JSX.',
        ),
      ),
      Carousel({
        items: testimonials,
        renderSlide: (t) =>
          $.article(
            { class: sTestimonialCard },
            $.p({ class: sTestimonialCard.quote }, `“${t.quote}”`),
            $.div(
              {},
              $.p({ class: sTestimonialCard.author }, t.author),
              $.p({ class: sTestimonialCard.role }, t.role),
            ),
          ),
      }),
    ),
    $.div(
      { class: sCard },
      $.h2({ class: sCard.title }, 'Entrar'),
      $.p({ class: sCard.muted }, 'Sessão JWT com refresh em cookie.'),
      $.p(
        { class: sCard.muted, style: 'font-size:var(--text-sm);margin-top:0' },
        'Login demo: demo@miniq.io / 12345678',
      ),
      $.form(
        { class: sForm, on: { submit: [submit, $handle.prevent] } },
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
          loading: () => submitting.value,
        }),
      ),
      $.p(
        { class: sAuthGate.self },
        'Não tem conta? ',
        $.button(
          {
            class: sAuthGate.link,
            type: 'button',
            on: { click: () => (screen.value = 'register') },
          },
          'Cadastrar empresa',
        ),
      ),
    ),
  );
}
