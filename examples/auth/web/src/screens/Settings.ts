import $ from 'mini-q';
import { useSettings } from '../composables/useSettings';
import { Switch } from '../ui/Switch';
import { Select } from '../ui/Select';
import { sCard, sForm } from '../ui/shell.style';
import { sSettings } from './Settings.style';

export function Settings() {
  const s = useSettings();

  return $.section(
    { class: sCard },
    $.h2({ class: sCard.title }, 'Configurações'),
    $.p({ class: sCard.muted }, 'Preferências da conta e notificações.'),

    $.div(
      { class: sSettings },
      $.div(
        { class: sSettings.group },
        $.h3({ class: sSettings.groupTitle }, 'Notificações'),
        $.div(
          { class: sSettings.row },
          $.div(
            { class: sSettings.text },
            $.strong({}, 'E-mails de marketing'),
            $.p({ class: sCard.muted, style: 'margin:0' },
              'Receber novidades e dicas da plataforma.',
            ),
          ),
          Switch({
            checked: s.marketingEmails,
            onChange: s.setMarketingEmails,
            label: 'Ativado',
            hint: 'pode ser alterado a qualquer momento',
          }),
        ),
        $.div(
          { class: sSettings.row },
          $.div(
            { class: sSettings.text },
            $.strong({}, 'Resumo semanal'),
            $.p({ class: sCard.muted, style: 'margin:0' },
              'Relatório por e-mail toda segunda-feira.',
            ),
          ),
          Switch({
            checked: s.weeklyDigest,
            onChange: s.setWeeklyDigest,
            label: 'Ativado',
          }),
        ),
      ),

      $.div(
        { class: sSettings.group },
        $.h3({ class: sSettings.groupTitle }, 'Segurança'),
        $.div(
          { class: sSettings.row },
          $.div(
            { class: sSettings.text },
            $.strong({}, 'Autenticação de dois fatores'),
            $.p({ class: sCard.muted, style: 'margin:0' },
              'Exigir código extra ao fazer login.',
            ),
          ),
          Switch({
            checked: s.twoFactor,
            onChange: s.setTwoFactor,
            label: 'Ativado',
          }),
        ),
      ),

      $.div(
        { class: sSettings.group },
        $.h3({ class: sSettings.groupTitle }, 'Aparência'),
        $.div(
          { class: sSettings.row },
          $.div(
            { class: sSettings.text },
            $.strong({}, 'Tema'),
            $.p({ class: sCard.muted, style: 'margin:0' },
              'Escolha o tema da interface.',
            ),
          ),
          Select({
            value: s.theme,
            options: [
              { value: 'dark', label: 'Escuro' },
              { value: 'light', label: 'Claro' },
              { value: 'system', label: 'Sistema' },
            ],
            onChange: () => s.setTheme(s.theme.value),
          }),
        ),
      ),
    ),

    $.div(
      { class: sForm.actions },
      $.button(
        {
          class: 'text-link',
          type: 'button',
          on: { click: s.reset },
          style:
            'background:none;border:none;color:var(--fg-muted);cursor:pointer;font:inherit;text-decoration:underline;padding:0;',
        },
        'Restaurar padrões',
      ),
    ),
  );
}
