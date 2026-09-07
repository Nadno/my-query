import $ from 'mini-q';
import type { FormApi } from '../composables/useForm';
import { useField } from '../composables/useForm';
import type { useAsyncValidator } from '../composables/useAsyncValidator';
import { maskCnpj } from '../composables/useMask';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { Select } from '../ui/Select';
import { form } from '../ui/theme';
import { applyMeiConstraint, type CompanyFormValues } from './model';

type EmailAsync = ReturnType<typeof useAsyncValidator>;

export function CompanyFields<T extends CompanyFormValues>(p: {
  form: FormApi<T>;
  emailAsync: EmailAsync;
}) {
  const companyName = useField(p.form, 'companyName');
  const cnpj = useField(p.form, 'cnpj');
  const email = useField(p.form, 'email');
  const type = p.form.fields.companyType;

  const onType = () => {
    if (type.value === 'MEI') applyMeiConstraint(p.form.fields.partners);
  };

  return $.div(
    { class: form, use: p.emailAsync.use },
    Field({
      label: 'Razão social',
      error: () => (p.form.touched.value.companyName ? companyName.error() : ''),
      control: TextInput({
        value: p.form.fields.companyName,
        placeholder: 'Empresa Exemplo LTDA',
        onBlur: companyName.touch,
      }),
    }),
    Field({
      label: 'CNPJ',
      error: () => (p.form.touched.value.cnpj ? cnpj.error() : ''),
      control: TextInput({
        value: p.form.fields.cnpj,
        placeholder: '00.000.000/0000-00',
        mask: maskCnpj,
        onBlur: cnpj.touch,
      }),
    }),
    Field({
      label: 'Tipo de empresa',
      control: Select({
        value: type,
        options: [
          { value: 'MEI', label: 'MEI' },
          { value: 'LTDA', label: 'LTDA' },
          { value: 'SA', label: 'S.A.' },
        ],
        onChange: onType,
      }),
    }),
    Field({
      label: 'E-mail corporativo',
      hint: () => (p.emailAsync.loading.value ? 'Verificando disponibilidade…' : ''),
      error: () => {
        if (p.emailAsync.error.value) return p.emailAsync.error.value;
        return p.form.touched.value.email ? email.error() : '';
      },
      control: TextInput({
        value: p.form.fields.email,
        type: 'email',
        placeholder: 'contato@empresa.com',
        autocomplete: 'email',
        onBlur: email.touch,
      }),
    }),
  );
}
