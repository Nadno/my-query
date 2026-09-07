import $ from 'mini-q';
import { useField, type FormApi } from '../composables/useForm';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { form } from '../ui/theme';
import type { RegisterFormValues } from './model';

export function AccessFields(p: { form: FormApi<RegisterFormValues> }) {
  const password = useField(p.form, 'password');
  const confirm = useField(p.form, 'confirmPassword');
  return $.div(
    { class: form },
    Field({
      label: 'Senha',
      hint: () => 'Mínimo 8 caracteres, com letra e número',
      error: () => (p.form.touched.value.password ? password.error() : ''),
      control: TextInput({
        value: p.form.fields.password,
        type: 'password',
        autocomplete: 'new-password',
        onBlur: password.touch,
      }),
    }),
    Field({
      label: 'Confirmar senha',
      error: () => (p.form.touched.value.confirmPassword ? confirm.error() : ''),
      control: TextInput({
        value: p.form.fields.confirmPassword,
        type: 'password',
        autocomplete: 'new-password',
        onBlur: confirm.touch,
      }),
    }),
  );
}
